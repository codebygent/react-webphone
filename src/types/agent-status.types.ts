export interface UserStatusResponse {
    success: boolean;
    message: string;
    timestamp: string;
    user_data: {
        extension: string;
        name: string;
        email: string;
        mobile_number: string;
        caller_id: string;
        status: string;
        is_enable: boolean;
        registered: boolean;
        role: string;
        account_guid: string;
    };
    status_info: {
        current_status: string;
        status_code: string;
        status_description: string;
        action_name: string;
        is_available: boolean;
        is_busy: boolean;
        is_offline: boolean;
    };
}

export interface AgentStatusMapping {
    success: boolean;
    message: string;
    timestamp: string;
    action_code_to_status_mapping: Record<string, string>;
    status_to_action_code_mapping: Record<string, string>;
    action_name_to_code_mapping: Record<string, string>;
    code_to_action_name_mapping: Record<string, string>;
    available_action_codes: string[];
    available_action_names: string[];
    available_statuses: string[];
}

export type AgentStatus = 'busy' | 'available' | 'offline';
export type ActionName = 'pause' | 'paused' | 'break' | 'lunch' | 'meeting' | 'training' |
    'unpause' | 'unpaused' | 'ready' | 'available' | 'online' | 'logout' | 'logged_out' |
    'offline' | 'disconnected' | 'login' | 'logged_in' | 'connect' | 'call' | 'on_call' |
    'talking' | 'in_call' | 'wrap' | 'wrap_up' | 'after_call';