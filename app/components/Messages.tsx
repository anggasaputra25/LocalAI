import Markdown from "react-markdown";
import { MessageType } from "../types/message";

type Props = {
  content: MessageType[];
};

const Messages = ({ content }: Props) => {
  return (
    <>
      {content.map((msg, idx) => (
        <div
          key={idx}
          className={`my-2 py-3 rounded-md rounded-t-none rounded-l-md max-w-full prose ${msg.role === 'user' ? 'bg-neutral-800 self-end ml-auto w-fit px-3' : 'text-white self-start mr-auto'}`}
        >
          <Markdown>{msg.text}</Markdown>
        </div>
      ))}
    </>
  );
};

export default Messages;