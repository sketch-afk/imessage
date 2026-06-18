import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";
import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import {
  Edit2Icon,
  Trash2Icon,
  CheckIcon,
  XIcon,
  CheckCheckIcon,
} from "lucide-react";
import { Button } from "@heroui/react";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({ message }) {
  const isOwnMessage = message.role === "me";

  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const messages = useChatStore((state) => state.messages);

  // Fallback to raw backend message to bypass frontend mappers that strip fields
  const rawMessage =
    messages.find((m) => m._id === (message.id || message._id)) || message;

  const isDeleted = rawMessage.isDeleted || false;
  const isEdited = rawMessage.isEdited || false;
  const displayText = rawMessage.text ?? message.text;
  const hasImage = Boolean(
    rawMessage.image || message.imageUrl || message.image,
  );
  const hasVideo = Boolean(
    rawMessage.video || message.videoUrl || message.video,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayText || "");

  // 1-hour limit check (fallback to Date.now() if createdAt is stripped by frontend mapper)
  const messageDate = new Date(
    rawMessage.createdAt || message.createdAt || Date.now(),
  );
  const isUnderOneHour = Date.now() - messageDate.getTime() < 3600000;
  const isEditable = isOwnMessage && !isDeleted && isUnderOneHour;

  let editTimeStr = "";
  if (isEdited && rawMessage.updatedAt) {
    const d = new Date(rawMessage.updatedAt);
    editTimeStr = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(message.id || message._id);
    }
  };

  const handleEditSave = async () => {
    if (!editValue.trim() || editValue === displayText) {
      setIsEditing(false);
      return;
    }
    const success = await editMessage(message.id || message._id, editValue);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group flex w-full items-center gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {/* Action Menu (Left side for own messages) */}
      {isEditable && !isEditing && (
        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
          {!hasImage && !hasVideo && (
            <button
              onClick={() => {
                setEditValue(displayText || "");
                setIsEditing(true);
              }}
              className="p-1.5 text-muted hover:text-accent"
              aria-label="Edit message"
            >
              <Edit2Icon className="size-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-muted hover:text-danger"
            aria-label="Delete message"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      )}

      <div
        className={`max-w-[min(90%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
          isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface"
        } ${isDeleted ? "border border-border !bg-transparent !text-muted italic shadow-none" : ""}`}
      >
        {isDeleted ? (
          <p className="text-[14px]">This message was deleted</p>
        ) : isEditing ? (
          <div className="flex min-w-[200px] flex-col gap-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full resize-none rounded-md bg-surface/20 p-2 text-[15px] text-accent-foreground placeholder-accent-foreground/50 outline-none focus:ring-2 focus:ring-white/50"
              rows={2}
              autoFocus
            />
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={() => setIsEditing(false)}
                className="text-accent-foreground/75 hover:bg-white/20"
              >
                <XIcon className="size-4" />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={handleEditSave}
                className="text-accent-foreground/75 hover:bg-white/20"
              >
                <CheckIcon className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {hasImage ? (
              <img
                src={withTransform(
                  rawMessage.image || message.imageUrl || message.image,
                  IMAGE_TRANSFORM,
                )}
                alt=""
                className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
              />
            ) : null}
            {hasVideo ? (
              <MessageVideo
                src={rawMessage.video || message.videoUrl || message.video}
              />
            ) : null}
            {displayText ? (
              <p className="whitespace-pre-wrap wrap-break-word">
                {displayText}
              </p>
            ) : null}
          </>
        )}

        {!isEditing && (
          <p
            className={`mt-1 flex items-center gap-1 text-[11px] tabular-nums ${
              isDeleted
                ? "text-muted/75"
                : isOwnMessage
                  ? "text-accent-foreground/75"
                  : "text-muted"
            }`}
          >
            {message.time}
            {isEdited && !isDeleted && (
              <span className="opacity-75">(edited {editTimeStr})</span>
            )}
            {isOwnMessage && !isDeleted && (
              <span className="ml-1 inline-flex items-center rounded-full px-0.5 py-[1px] shadow-sm">
                {rawMessage.status === "seen" ? (
                  <CheckCheckIcon className="size-3.5 text-blue-800" />
                ) : rawMessage.status === "delivered" ? (
                  <CheckCheckIcon className="size-3.5 text-white" />
                ) : (
                  <CheckIcon className="size-3.5 text-white" />
                )}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
