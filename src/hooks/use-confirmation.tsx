"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(
    null,
  );

  const confirm = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmation({
          ...options,
          isOpen: true,
          onConfirm: () => {
            setConfirmation(null);
            resolve(true);
          },
          onCancel: () => {
            setConfirmation(null);
            resolve(false);
          },
        });
      });
    },
    [],
  );

  const ConfirmationDialog = useCallback(() => {
    if (!confirmation) return null;

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        confirmation.onCancel();
      }
    };

    return (
      <AlertDialog open={confirmation.isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              {confirmation.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={confirmation.onCancel}>
              {confirmation.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmation.onConfirm}
              className={
                confirmation.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  : ""
              }
            >
              {confirmation.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [confirmation]);

  return { confirm, ConfirmationDialog };
}
