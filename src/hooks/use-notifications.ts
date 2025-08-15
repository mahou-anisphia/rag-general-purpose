"use client";

import { toast } from "sonner";

export interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
}

export interface ErrorNotificationOptions {
  title?: string;
  error: Error | string;
  duration?: number;
}

export interface SuccessNotificationOptions {
  title: string;
  description?: string;
  duration?: number;
}

export function useNotifications() {
  const showSuccess = ({
    title,
    description,
    duration = 5000,
  }: SuccessNotificationOptions) => {
    toast.success(title, {
      description,
      duration,
    });
  };

  const showError = ({
    title = "Error",
    error,
    duration = 5000,
  }: ErrorNotificationOptions) => {
    const message = error instanceof Error ? error.message : error;
    toast.error(title, {
      description: message,
      duration,
    });
  };

  const showInfo = ({
    title,
    description,
    duration = 5000,
  }: NotificationOptions) => {
    toast.info(title, {
      description,
      duration,
    });
  };

  const showWarning = ({
    title,
    description,
    duration = 5000,
  }: NotificationOptions) => {
    toast.warning(title, {
      description,
      duration,
    });
  };

  const showPromise = <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromise,
  };
}
