"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";

import styles from "./contact-support.module.css";
import { supabase } from "../../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "headset"
  | "chat"
  | "whatsapp"
  | "phone"
  | "email"
  | "clock"
  | "check"
  | "shield"
  | "arrow";

function Icon({
  name,
  size = 22,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "headset") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="M4 14a8 8 0 0 1 16 0" />
          <path d="M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
          <path d="M20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
          <path d="M17 19c0 1.1-.9 2-2 2h-2" />
        </svg>
      </span>
    );
  }

  if (name === "chat") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.7L4 20l1.7-3.5A7.4 7.4 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
          <path d="M8 11h8" />
          <path d="M8 14h5" />
        </svg>
      </span>
    );
  }

  if (name === "whatsapp") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.6-4.1A8 8 0 1 1 20 11.5Z" />
          <path d="M8.5 8.5c.3-.4.6-.4.9-.1l1 .9c.2.2.2.5 0 .8l-.5.7c.7 1.3 1.5 2 2.8 2.7l.7-.5c.3-.2.6-.2.8 0l.9 1c.3.3.2.7-.1.9-.5.4-1.1.6-1.7.4-2.7-.8-4.8-2.7-5.8-5.3-.2-.6 0-1.2.4-1.5Z" />
        </svg>
      </span>
    );
  }

  if (name === "phone") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="M7 4h3l1 4-2 1.5a14 14 0 0 0 5.5 5.5L16 13l4 1v3c0 1.1-.9 2-2 2C10.3 19 5 13.7 5 6c0-1.1.9-2 2-2Z" />
        </svg>
      </span>
    );
  }

  if (name === "email") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </span>
    );
  }

  if (name === "clock") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
    );
  }

  if (name === "check") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
    );
  }

  if (name === "shield") {
    return (
      <span
        className={`${styles.icon} ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg {...commonProps}>
          <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg {...commonProps}>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

/*
============================================================
CONTACT INFORMATION
============================================================
*/

const SUPPORT_EMAIL =
  "support@propertysure.ai";

const SUPPORT_PHONE =
  "Support phone — coming soon";

const SUPPORT_WHATSAPP =
  "WhatsApp support — coming soon";

/*
============================================================
MESSAGE TYPE
============================================================
*/

type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "user" | "support";
  message: string;
  created_at: string;
};

/*
============================================================
PAGE
============================================================
*/

export default function ContactSupportPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [userId, setUserId] =
    useState("");

  const [userName, setUserName] =
    useState("");

  const [userEmail, setUserEmail] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(false);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<SupportMessage[]>([]);

  const [sending, setSending] =
    useState(false);

  const [startingChat, setStartingChat] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (mounted) {
          const metadata =
            authUser.user_metadata ?? {};

          setUserId(authUser.id);

          setUserName(
            metadata.full_name ||
              metadata.name ||
              ""
          );

          setUserEmail(
            authUser.email || ""
          );
        }
      } catch (error) {
        console.error(
          "Contact support user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const backToSupportHelp = () => {
    router.push("/settings/support-help");
  };

  /*
  ============================================================
  ADD MESSAGE WITHOUT DUPLICATES
  ============================================================
  */

  const addMessage = (
    incomingMessage: SupportMessage
  ) => {
    setMessages((currentMessages) => {
      const alreadyExists =
        currentMessages.some(
          (existingMessage) =>
            existingMessage.id ===
            incomingMessage.id
        );

      if (alreadyExists) {
        return currentMessages;
      }

      return [
        ...currentMessages,
        incomingMessage,
      ].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    });
  };

  /*
  ============================================================
  LOAD CONVERSATION MESSAGES
  ============================================================
  */

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let mounted = true;

    const loadMessages = async () => {
      const {
        data,
        error,
      } = await supabase
        .from("support_messages")
        .select(
          "id, conversation_id, sender_id, sender_type, message, created_at"
        )
        .eq(
          "conversation_id",
          conversationId
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Could not load support messages:",
          error
        );

        if (mounted) {
          setChatError(
            "We could not load your previous messages. Please try again."
          );
        }

        return;
      }

      if (mounted) {
        setMessages(
          (data as SupportMessage[]) || []
        );
      }
    };

    loadMessages();

    /*
    ==========================================================
    REALTIME SUBSCRIPTION
    ==========================================================
    */

    const channel = supabase
      .channel(
        `support-chat-${conversationId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incomingMessage =
            payload.new as SupportMessage;

          addMessage(incomingMessage);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            "PropertySure support chat connected."
          );
        }

        if (status === "CHANNEL_ERROR") {
          console.error(
            "PropertySure support chat realtime error."
          );
        }
      });

    return () => {
      mounted = false;

      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /*
  ============================================================
  START LIVE CHAT
  ============================================================
  */

  const startLiveChat = async () => {
    if (!userId || startingChat) {
      return;
    }

    setStartingChat(true);
    setChatError("");

    try {
      /*
      ----------------------------------------------------------
      FIND EXISTING OPEN CONVERSATION
      ----------------------------------------------------------
      */

      const {
        data: existingConversation,
        error: existingConversationError,
      } = await supabase
        .from("support_conversations")
        .select(
          "id, status, created_at, updated_at"
        )
        .eq("user_id", userId)
        .eq("status", "open")
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (existingConversationError) {
        console.error(
          "Could not find support conversation:",
          existingConversationError
        );

        setChatError(
          "We could not open your support conversation. Please try again."
        );

        return;
      }

      let activeConversationId =
        existingConversation?.id || null;

      /*
      ----------------------------------------------------------
      CREATE NEW CONVERSATION IF NEEDED
      ----------------------------------------------------------
      */

      if (!activeConversationId) {
        const {
          data: newConversation,
          error: createConversationError,
        } = await supabase
          .from("support_conversations")
          .insert({
            user_id: userId,
            status: "open",
            subject:
              "PropertySure AI Support",
          })
          .select(
            "id, status, created_at, updated_at"
          )
          .single();

        if (createConversationError) {
          console.error(
            "Could not create support conversation:",
            createConversationError
          );

          setChatError(
            "We could not start the support conversation. Please try again."
          );

          return;
        }

        activeConversationId =
          newConversation.id;
      }

      setConversationId(
        activeConversationId
      );

      setChatOpen(true);
    } catch (error) {
      console.error(
        "Start live chat error:",
        error
      );

      setChatError(
        "Something went wrong while opening live chat."
      );
    } finally {
      setStartingChat(false);
    }
  };

  /*
  ============================================================
  SEND CHAT MESSAGE
  ============================================================
  */

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !conversationId ||
      !userId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setChatError("");

    try {
      const {
        data: insertedMessage,
        error,
      } = await supabase
        .from("support_messages")
        .insert({
          conversation_id:
            conversationId,

          sender_id: userId,

          sender_type: "user",

          message: trimmedMessage,
        })
        .select(
          "id, conversation_id, sender_id, sender_type, message, created_at"
        )
        .single();

      if (error) {
        console.error(
          "Could not send support message:",
          error
        );

        setChatError(
          "Your message could not be sent. Please try again."
        );

        return;
      }

      if (insertedMessage) {
        addMessage(
          insertedMessage as SupportMessage
        );
      }

      setMessage("");
    } catch (error) {
      console.error(
        "Send support message error:",
        error
      );

      setChatError(
        "Something went wrong while sending your message."
      );
    } finally {
      setSending(false);
    }
  };

  /*
  ============================================================
  FORMAT MESSAGE TIME
  ============================================================
  */

  const formatMessageTime = (
    createdAt: string
  ) => {
    try {
      return new Intl.DateTimeFormat(
        undefined,
        {
          hour: "numeric",
          minute: "2-digit",
        }
      ).format(new Date(createdAt));
    } catch {
      return "";
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className={styles.page}>
        <div className={styles.mainInner}>

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <button
            type="button"
            className={styles.backButton}
            onClick={backToSupportHelp}
          >
            <span
              className={styles.backArrow}
              aria-hidden="true"
            >
              ←
            </span>

            Back to Support & Help
          </button>

          {/* ==================================================
              HERO
          ================================================== */}

          <section className={styles.heroCard}>
            <div className={styles.heroIcon}>
              <Icon
                name="headset"
                size={42}
              />
            </div>

            <span className={styles.eyebrow}>
              CUSTOMER SUPPORT
            </span>

            <h1>
              Contact Support
            </h1>

            <p>
              Need help with PropertySure AI?
              Connect with our support team
              directly through live chat, email,
              WhatsApp, or phone support.
            </p>

            <div className={styles.statusPill}>
              <span
                className={styles.statusDot}
              />

              Support team available
            </div>
          </section>

          {/* ==================================================
              QUICK CONTACT OPTIONS
          ================================================== */}

          <section
            className={styles.contactOptions}
          >
            {/* ==================================================
                LIVE CHAT
            ================================================== */}

            <button
              type="button"
              className={`${styles.contactOption} ${styles.liveChatOption}`}
              onClick={startLiveChat}
              disabled={startingChat}
            >
              <div
                className={`${styles.contactOptionIcon} ${styles.blue}`}
              >
                <Icon
                  name="chat"
                  size={25}
                />
              </div>

              <div
                className={
                  styles.contactOptionContent
                }
              >
                <div
                  className={
                    styles.optionTitleRow
                  }
                >
                  <strong>
                    Live Chat
                  </strong>

                  <span
                    className={
                      styles.availableBadge
                    }
                  >
                    Available
                  </span>
                </div>

                <span>
                  Chat directly with a
                  PropertySure AI support
                  representative.
                </span>

                <small>
                  {startingChat
                    ? "Opening conversation..."
                    : "Start a conversation now"}
                </small>
              </div>

              <span
                className={styles.optionArrow}
              >
                →
              </span>
            </button>

            {/* ==================================================
                WHATSAPP
            ================================================== */}

            <div
              className={
                styles.contactOption
              }
            >
              <div
                className={`${styles.contactOptionIcon} ${styles.green}`}
              >
                <Icon
                  name="whatsapp"
                  size={25}
                />
              </div>

              <div
                className={
                  styles.contactOptionContent
                }
              >
                <strong>
                  WhatsApp Support
                </strong>

                <span>
                  Contact our team through
                  WhatsApp for quick assistance.
                </span>

                <small>
                  {SUPPORT_WHATSAPP}
                </small>
              </div>

              <span
                className={
                  styles.comingSoonBadge
                }
              >
                Coming soon
              </span>
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

            <div
              className={
                styles.contactOption
              }
            >
              <div
                className={`${styles.contactOptionIcon} ${styles.purple}`}
              >
                <Icon
                  name="phone"
                  size={25}
                />
              </div>

              <div
                className={
                  styles.contactOptionContent
                }
              >
                <strong>
                  Phone Support
                </strong>

                <span>
                  Speak directly with a
                  member of our support team.
                </span>

                <small>
                  {SUPPORT_PHONE}
                </small>
              </div>

              <span
                className={
                  styles.comingSoonBadge
                }
              >
                Coming soon
              </span>
            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={
                styles.contactOption
              }
            >
              <div
                className={`${styles.contactOptionIcon} ${styles.orange}`}
              >
                <Icon
                  name="email"
                  size={25}
                />
              </div>

              <div
                className={
                  styles.contactOptionContent
                }
              >
                <strong>
                  Email Support
                </strong>

                <span>
                  Send us a detailed message
                  and our team will follow up.
                </span>

                <small>
                  {SUPPORT_EMAIL}
                </small>
              </div>

              <span
                className={styles.optionArrow}
              >
                →
              </span>
            </a>
          </section>

          {/* ==================================================
              CHAT ERROR
          ================================================== */}

          {chatError && (
            <div
              className={styles.chatError}
              role="alert"
            >
              {chatError}
            </div>
          )}

          {/* ==================================================
              LIVE CHAT AREA
          ================================================== */}

          {chatOpen && (
            <section
              className={styles.chatCard}
            >
              <div
                className={styles.chatHeader}
              >
                <div
                  className={
                    styles.chatHeaderIdentity
                  }
                >
                  <div
                    className={
                      styles.chatAvatar
                    }
                  >
                    <Icon
                      name="headset"
                      size={21}
                    />
                  </div>

                  <div>
                    <strong>
                      PropertySure Support
                    </strong>

                    <span>
                      <span
                        className={
                          styles.chatOnlineDot
                        }
                      />

                      Online
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={
                    styles.closeChat
                  }
                  onClick={() =>
                    setChatOpen(false)
                  }
                  aria-label="Close live chat"
                >
                  ×
                </button>
              </div>

              <div
                className={
                  styles.chatMessages
                }
              >
                {/* ==================================================
                    WELCOME MESSAGE
                ================================================== */}

                <div
                  className={
                    styles.supportMessage
                  }
                >
                  <span
                    className={
                      styles.messageLabel
                    }
                  >
                    PropertySure Support
                  </span>

                  <p>
                    Hello
                    {userName
                      ? ` ${userName}`
                      : ""}{" "}
                    👋
                  </p>

                  <p>
                    How can we help you today?
                    Tell us what you need
                    assistance with and a
                    support representative
                    will assist you.
                  </p>

                  <small>
                    Just now
                  </small>
                </div>

                {/* ==================================================
                    REAL DATABASE MESSAGES
                ================================================== */}

                {messages.map(
                  (chatMessage) => {
                    const isUser =
                      chatMessage.sender_type ===
                      "user";

                    return (
                      <div
                        key={
                          chatMessage.id
                        }
                        className={
                          isUser
                            ? styles.userMessage
                            : styles.supportMessage
                        }
                      >
                        {!isUser && (
                          <span
                            className={
                              styles.messageLabel
                            }
                          >
                            PropertySure Support
                          </span>
                        )}

                        <p>
                          {
                            chatMessage.message
                          }
                        </p>

                        <small>
                          {formatMessageTime(
                            chatMessage.created_at
                          )}
                        </small>
                      </div>
                    );
                  }
                )}
              </div>

              <form
                className={styles.chatComposer}
                onSubmit={
                  handleSendMessage
                }
              >
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Write your message..."
                  rows={3}
                  disabled={sending}
                />

                <div
                  className={
                    styles.chatComposerBottom
                  }
                >
                  <span>
                    {userEmail ||
                      "Signed-in account"}
                  </span>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !message.trim() ||
                      !conversationId
                    }
                  >
                    {sending
                      ? "Sending..."
                      : "Send Message"}

                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ==================================================
              SUPPORT HOURS
          ================================================== */}

          <section
            className={styles.infoGrid}
          >
            <div
              className={styles.infoCard}
            >
              <div
                className={styles.infoIcon}
              >
                <Icon
                  name="clock"
                  size={22}
                />
              </div>

              <div>
                <span
                  className={
                    styles.infoEyebrow
                  }
                >
                  SUPPORT HOURS
                </span>

                <h3>
                  When you can reach us
                </h3>

                <p>
                  Live support availability
                  will be displayed here once
                  the support schedule is
                  configured.
                </p>
              </div>
            </div>

            <div
              className={styles.infoCard}
            >
              <div
                className={styles.infoIcon}
              >
                <Icon
                  name="check"
                  size={22}
                />
              </div>

              <div>
                <span
                  className={
                    styles.infoEyebrow
                  }
                >
                  RESPONSE TIME
                </span>

                <h3>
                  We will keep you updated
                </h3>

                <p>
                  Messages sent through
                  support will be associated
                  with your registered account
                  for follow-up.
                </p>
              </div>
            </div>
          </section>

          {/* ==================================================
              SECURITY NOTE
          ================================================== */}

          <section
            className={styles.securityNote}
          >
            <div
              className={
                styles.securityIcon
              }
            >
              <Icon
                name="shield"
                size={21}
              />
            </div>

            <div>
              <strong>
                Keep your account secure
              </strong>

              <p>
                Never send your password,
                verification codes, private
                keys, or other sensitive
                security credentials to
                support.
              </p>
            </div>
          </section>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className={styles.footerHelp}
          >
            <span>
              Looking for answers first?
            </span>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/settings/support-help/help-center"
                )
              }
            >
              Visit the Help Center
              <Icon
                name="arrow"
                size={17}
              />
            </button>
          </div>
        </div>
      </main>
    </AppShell>
  );
}