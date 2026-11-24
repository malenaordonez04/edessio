import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiver: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Message = model('Message', messageSchema);

export default Message;

