import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { submitContactMessage } from "../services/contactService";
import type { ContactMessageType } from "../types";

export const useContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<ContactMessageType>("ProblemReport");

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: submitContactMessage,
    onSuccess: () => setMessage(""),
  });

  const onChangeMessageType = (event: ChangeEvent<HTMLInputElement>) =>
    setMessageType(event.target.value as ContactMessageType);

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) =>
    setEmail(event.target.value);

  const onChangeMessage = (event: ChangeEvent<HTMLInputElement>) =>
    setMessage(event.target.value);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate({
      name,
      email,
      message,
      messageType,
      source: "ksefast-web",
      additionalProperties: {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      },
    });
  };

  return {
    fields: { name, email, message, messageType },
    handlers: { onChangeName, onChangeEmail, onChangeMessage, onChangeMessageType },
    onSubmit,
    isPending,
    isSuccess,
    isError,
    error,
  };
};
