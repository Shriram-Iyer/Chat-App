export interface ChatMessage {
    _id: string;
    sender_id: string;
    receiver_id: string;
    text?: string;
    image?: string;
    video?: string;
    created_at: string;
    updated_at: string;
}