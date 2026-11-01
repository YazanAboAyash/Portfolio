/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Check, Send, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { feedbackSchema } from "@/lib/feedback/schema";
import { useFeedbackSubmit } from "@/hooks/use-feedback";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_NAME_MAX,
  FEEDBACK_TOPICS,
} from "@/data/configs/feedback";
import type { FeedbackInput } from "@/types/configs/feedback";
import type { SupportedLocale } from "@/types/configs/i18n";
import { cn } from "@/lib/utils";

const groupLabelClass =
  "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

const fieldClass =
  "rounded-none border-transparent bg-surface px-4 text-base shadow-none md:text-base dark:bg-surface";

const actionClass =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap px-5 font-semibold sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The feedback form. Validated in the browser with the same schema the API
 * checks again, so a visitor sees a field error before anything is sent.
 * Nothing is published from here: the server moderates the entry and it waits
 * for the owner's approval.
 */
export default function FeedbackForm() {
  const t = useTranslations("Feedback");
  const locale = useLocale() as SupportedLocale;
  const { state, submit, reset: resetSubmit } = useFeedbackSubmit();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      topic: "website",
      rating: null,
      message: "",
      // Opt-in: a pre-ticked box is not consent under the GDPR.
      consentToPublish: false,
      locale,
      website: "",
      startedAt: 0,
    },
  });

  // Stamped after mount, so the server's minimum fill time counts from when
  // the form could first be seen.
  useEffect(() => {
    setValue("startedAt", Date.now());
  }, [setValue]);

  const messageLength = useWatch({ control, name: "message" }).length;

  const errorText = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    return t.has(`errors.${key}`) ? t(`errors.${key}`) : t("errors.generic");
  };

  const onSubmit = async (values: FeedbackInput): Promise<void> => {
    if (await submit({ ...values, locale })) {
      reset();
      setValue("startedAt", Date.now());
    }
  };

  // A refused entry is answered with a wry note from Reem rather than a
  // rejection, and without the "send another" button that would invite retries.
  if (state.status === "sent" && state.outcome === "filed") {
    return (
      <div className="flex flex-col items-start gap-5 bg-surface p-6 md:p-8" role="status">
        <span className="flex size-10 items-center justify-center bg-background">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold tracking-[-0.01em]">
            {t("filed.title")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {t("filed.description")}
          </p>
          <p className="mt-3 text-sm font-semibold">{t("filed.signature")}</p>
        </div>
      </div>
    );
  }

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-start gap-5 bg-surface p-6 md:p-8" role="status">
        <span className="flex size-10 items-center justify-center bg-background">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-lg font-semibold tracking-[-0.01em]">
            {t("success.title")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            {t("success.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={resetSubmit}
          className={cn(actionClass, "bg-background transition-colors hover:bg-surface-2")}
        >
          {t("success.again")}
        </button>
      </div>
    );
  }

  const nameError = errorText(errors.name?.message);
  const messageError = errorText(errors.message?.message);

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="flex flex-col gap-6"
      aria-label={t("formLabel")}
    >
      {/* Topic */}
      <fieldset className="flex flex-col gap-3">
        <legend className={cn(groupLabelClass, "mb-3")}>{t("topicLabel")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {FEEDBACK_TOPICS.map((topic) => (
            <label
              key={topic}
              className="flex min-h-12 cursor-pointer items-center justify-center bg-surface px-4 text-center font-semibold transition-colors hover:bg-surface-2 has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground"
            >
              <input
                type="radio"
                value={topic}
                className="sr-only"
                {...register("topic")}
              />
              {t(`topics.${topic}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-3">
            <legend className={cn(groupLabelClass, "mb-3")}>
              {t("ratingLabel")}{" "}
              <span className="font-normal normal-case tracking-normal">
                ({t("optional")})
              </span>
            </legend>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = field.value !== null && value <= field.value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={field.value === value}
                    aria-label={t("rateValue", { value })}
                    // Choosing the current rating again clears it.
                    onClick={() =>
                      field.onChange(field.value === value ? null : value)
                    }
                    className="flex size-11 cursor-pointer items-center justify-center transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        active ? "fill-foreground text-foreground" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      />

      {/* Name */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="feedback-name" className={groupLabelClass}>
          {t("nameLabel")}{" "}
          <span className="font-normal normal-case tracking-normal">
            ({t("optional")})
          </span>
        </Label>
        <Input
          id="feedback-name"
          autoComplete="name"
          maxLength={FEEDBACK_NAME_MAX}
          placeholder={t("namePlaceholder")}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? "feedback-name-error" : undefined}
          className={cn(fieldClass, "h-12")}
          {...register("name")}
        />
        {nameError && (
          <p id="feedback-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="feedback-message" className={groupLabelClass}>
          {t("messageLabel")}
        </Label>
        <Textarea
          id="feedback-message"
          rows={5}
          maxLength={FEEDBACK_MESSAGE_MAX}
          placeholder={t("messagePlaceholder")}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={cn(
            "feedback-message-count",
            messageError && "feedback-message-error",
          )}
          className={cn(fieldClass, "min-h-36 py-3")}
          {...register("message")}
        />
        <div className="flex items-start justify-between gap-4">
          <p id="feedback-message-error" className="text-sm text-destructive">
            {messageError}
          </p>
          <p
            id="feedback-message-count"
            className="shrink-0 text-xs tabular-nums text-muted-foreground"
          >
            {t("count", { count: messageLength, max: FEEDBACK_MESSAGE_MAX })}
          </p>
        </div>
      </div>

      {/* Honeypot: off-screen for people, irresistible to form-filling bots */}
      <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {/* Consent to publish */}
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-foreground"
          {...register("consentToPublish")}
        />
        <span>{t("consentLabel")}</span>
      </label>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("moderationNote")}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={state.status === "sending"}
          className={cn(
            actionClass,
            "w-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:w-fit",
          )}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {state.status === "sending" ? t("sending") : t("submit")}
        </button>
        <p role="alert" className="text-sm text-destructive">
          {state.status === "error" ? t(`submitErrors.${state.code}`) : ""}
        </p>
      </div>
    </form>
  );
}
