import { Schema, model } from "mongoose";

import type { INotification } from "../types/notification.types.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    actionUrl: {
      type: String,
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;
