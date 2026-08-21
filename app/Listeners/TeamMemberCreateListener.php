<?php

namespace App\Listeners;

use App\Events\TeamMemberCreated;
use App\Services\EmailTemplateService;
use Exception;

class TeamMemberCreateListener
{
    public function handle(TeamMemberCreated $event)
    {
         if(isEmailTemplateEnabled('New Team Member', getCompanyId(auth()->id())                                                    ) && !IsDemo()){

        try {


            // Check if New Team Member email template is active for current user
            $emailService = new EmailTemplateService();

            $teamMember = $event->teamMember;
            $requestData = $event->requestData;

            if (!$teamMember) {
                return;
            }

            $creator = $teamMember->creator;

            if (!$teamMember || !$teamMember->email) {
                return;
            }

            $variables = [
                '{user_name}' => auth()->user()->name ?? 'System Administrator',
                '{name}' => $teamMember->name ?? 'Team Member',
                '{email}' => $teamMember->email ?? 'Not provided',
                // Passwords are not sent through email templates or retained
                // in listener data. Administrators can direct users to reset
                // their password through the authenticated reset flow.
                '{password}' => __('Set by your administrator; use password reset if needed.'),
                '{role}' => ucfirst($teamMember->type ?? 'team_member'),
                '{phone_no}' => $teamMember->phone ?? 'Not provided',
                '{app_name}' => config('app.name', 'Legal Management System'),
            ];

            // Get language from currently logged-in user
            $userLanguage = auth()->user()->lang ?? 'en';

            $emailService->sendTemplateEmailWithLanguage(
                'New Team Member',
                $variables,
                (string) $teamMember->email,
                (string) $teamMember->name,
                $userLanguage
            );
        } catch (Exception $e) {
            return back()->withErrors(['error' => __($e->getMessage())]);
        }
    }
}
}
