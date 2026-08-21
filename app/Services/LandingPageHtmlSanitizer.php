<?php

namespace App\Services;

class LandingPageHtmlSanitizer
{
    public function sanitize(string $html): string
    {
        $config = \HTMLPurifier_Config::createDefault();
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('Cache.DefinitionImpl', null);
        $config->set('HTML.Allowed', implode(',', [
            'p,br,hr,blockquote,pre,code',
            'strong,b,em,i,u,s,span',
            'h1,h2,h3,h4,h5,h6',
            'ul,ol,li',
            'a[href|title|target|rel]',
            'img[src|alt|title|width|height]',
            'table,thead,tbody,tfoot,tr,th,td',
        ]));
        $config->set('URI.AllowedSchemes', [
            'http' => true,
            'https' => true,
            'mailto' => true,
        ]);
        $config->set('HTML.Nofollow', true);

        return (new \HTMLPurifier($config))->purify($html);
    }

    /** @param array<string, mixed> $configSections */
    public function sanitizeConfigSections(array $configSections): array
    {
        foreach ($configSections['sections'] ?? [] as $index => $section) {
            if (is_array($section) && isset($section['story_content']) && is_string($section['story_content'])) {
                $configSections['sections'][$index]['story_content'] = $this->sanitize($section['story_content']);
            }
        }

        return $configSections;
    }
}
