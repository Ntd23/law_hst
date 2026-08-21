<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Validates outbound webhook URLs before cURL can reach them.
 *
 * This is intentionally restrictive: integrations are public HTTPS endpoints,
 * never loopback, link-local, private, or reserved network addresses.
 */
class OutboundUrlGuard
{
    /**
     * @return array{host: string, port: int, ips: array<int, string>}
     */
    public function assertAllowed(string $url): array
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if ($scheme !== 'https' || $host === '' || isset($parts['user']) || isset($parts['pass'])) {
            throw new InvalidArgumentException('Only public HTTPS webhook URLs are allowed.');
        }

        if ($host === 'localhost' || str_ends_with($host, '.localhost')) {
            throw new InvalidArgumentException('Local webhook hosts are not allowed.');
        }

        $ips = filter_var($host, FILTER_VALIDATE_IP) ? [$host] : $this->resolveHost($host);
        if ($ips === []) {
            throw new InvalidArgumentException('Webhook host could not be resolved.');
        }

        foreach ($ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                throw new InvalidArgumentException('Webhook host resolves to a private or reserved address.');
            }
        }

        return [
            'host' => $host,
            'port' => (int) ($parts['port'] ?? 443),
            'ips' => array_values(array_unique($ips)),
        ];
    }

    /** @return array<int, string> */
    private function resolveHost(string $host): array
    {
        $records = dns_get_record($host, DNS_A | DNS_AAAA) ?: [];
        $ips = [];

        foreach ($records as $record) {
            if (isset($record['ip'])) {
                $ips[] = $record['ip'];
            }
            if (isset($record['ipv6'])) {
                $ips[] = $record['ipv6'];
            }
        }

        return $ips;
    }
}
