import { ToolInvocation } from "@ai-sdk/ui-utils";
import { motion } from "framer-motion";
import { UserIcon } from "lucide-react";
import Image from "next/image";
import { IoSparklesSharp } from "react-icons/io5";

import { Markdown } from "./Markdown";
import { TextShimmer } from "./TextShimmer";
export const ThinkingMessage = ({ content }: { content: string }) => {
  return (
    <motion.div
      className="mx-auto w-full max-w-3xl pb-10 pl-2"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex w-full gap-2 rounded-lg">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-white">
          <IoSparklesSharp />
        </div>

        <TextShimmer duration={1.0}>{content}</TextShimmer>
      </div>
    </motion.div>
  );
};

interface AssistantProps {
  content: string;
  toolInvocations?: ToolInvocation[];
  onTimestampClick?: (seconds: number, videoId: string) => void;
  videoId?: string;
}

export const AssistantMessage = ({
  content,
  toolInvocations,
  onTimestampClick,
  videoId,
}: AssistantProps) => {
  return (
    <motion.div
      className="mx-auto w-full max-w-3xl px-2 pb-0"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {content && (
        <div className="flex w-full items-start justify-start gap-2 rounded-lg">
          <div className="mt-2 flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-600 text-white">
            <IoSparklesSharp />
          </div>
          <div className="max-w-full rounded-xl pt-1 text-white sm:max-w-[95%]">
            <Markdown
              onTimestampClick={onTimestampClick}
              currentVideoId={videoId}
            >
              {content}
            </Markdown>
          </div>
        </div>
      )}

      {toolInvocations &&
        toolInvocations.map((toolInvocation) => {
          const { toolCallId, toolName, state } = toolInvocation;

          if (state !== "result") {
            return (
              <div key={toolCallId}>
                {toolName === "retrieveSpecificEventWithTimestamp" ? (
                  <div className="flex w-full items-start justify-start gap-4 rounded-lg max-sm:gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-600 text-white">
                      <IoSparklesSharp />
                    </div>
                    <TextShimmer>Searching through the lecture...</TextShimmer>
                  </div>
                ) : null}
              </div>
            );
          } else {
            return null;
          }
        })}
    </motion.div>
  );
};

interface UserMessageProps {
  content: string;
  picture?: string;
}

export const UserMessage = ({ content, picture }: UserMessageProps) => {
  return (
    <motion.div
      className="mx-auto w-full max-w-3xl px-2"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex w-full items-start  justify-end gap-2 rounded-lg">
        <div className="max-w-full rounded-lg bg-[#DCA20B] px-2 py-1 font-medium text-black sm:max-w-[80%]">
          {content}
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-600 text-white">
          {picture ? (
            <Image
              src={JSON.parse(picture)}
              height={32}
              width={32}
              alt="User"
            />
          ) : (
            <UserIcon />
          )}
        </div>
      </div>
    </motion.div>
  );
};
