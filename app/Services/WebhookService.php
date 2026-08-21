<?php

namespace App\Services;

use App\Models\Webhook;

class WebhookService
{
    public function triggerWebhooks(string $module, array $data, int $userId): void
    {
        $webhook = $this->webhookSetting($module, $userId);
        
        if ($webhook) {
            $parameter = json_encode($data);
            $status = $this->webhookCall($webhook['url'], $parameter, $webhook['method']);
        }
    }
    
    private function webhookSetting($module, $id)
    {
        $webhook = Webhook::where('module', $module)->where('user_id', $id)->first();
        
        if (!empty($webhook)) {
            $url = $webhook->url;
            $method = $webhook->method;
            $reference_url = "https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

            $data['method'] = $method;
            $data['reference_url'] = $reference_url;
            $data['url'] = $url;
            return $data;
        }
        return false;
    }
    
    private function webhookCall($url = null, $parameter = null, $method = 'POST')
    {
        if (!empty($url) && !empty($parameter)) {
            try {
                app(OutboundUrlGuard::class)->assertAllowed($url);
                $curlHandle = curl_init($url);
                curl_setopt($curlHandle, CURLOPT_POSTFIELDS, $parameter);
                curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curlHandle, CURLOPT_CUSTOMREQUEST, strtoupper($method));
                curl_setopt($curlHandle, CURLOPT_FOLLOWLOCATION, false);
                curl_setopt($curlHandle, CURLOPT_PROTOCOLS, CURLPROTO_HTTPS);
                curl_setopt($curlHandle, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTPS);
                curl_setopt($curlHandle, CURLOPT_SSL_VERIFYPEER, true);
                curl_setopt($curlHandle, CURLOPT_SSL_VERIFYHOST, 2);
                $curlResponse = curl_exec($curlHandle);
                curl_close($curlHandle);
                
                if (empty($curlResponse)) {
                    return true;
                } else {
                    return false;
                }
            } catch (\Throwable $th) {
                return false;
            }
        } else {
            return false;
        }
    }
}
