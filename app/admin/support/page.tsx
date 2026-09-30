"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./support.module.css";
import { supabase } from "../../lib/supabase";

type Conversation = {
  id: string;
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: "open" | "closed";
  subject: string | null;
  created_at: string;
  updated_at: string;
};

type SupportMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "user" | "support";
  message: string;
  created_at: string;
};

type CustomerDetails = {
  user_id: string;
  email: string | null;
  customer_name: string | null;
};

type RealtimeMessagePayload = {
  new: SupportMessage;
};

type TemplateCategory =
  | "All"
  | "Greetings"
  | "Property Verification"
  | "Payments"
  | "Account"
  | "Technical"
  | "Security & Fraud"
  | "Closing";

type SupportTemplate = {
  id: string;
  category: Exclude<TemplateCategory, "All">;
  title: string;
  description: string;
  response: string;
  nextQuestion: string;
  nextResponse: string;
};

const SUPPORT_TEMPLATES: SupportTemplate[] = [
  {
    id: "greeting-initial",
    category: "Greetings",
    title: "Initial Greeting",
    description:
      "Use when a customer starts a new support conversation.",
    response:
      "Good day. Welcome to PropertySure AI Support. How may we assist you today?",
    nextQuestion:
      "If the customer explains the issue, what should we do next?",
    nextResponse:
      "Thank you for explaining that. We understand your concern, and we will be happy to assist you. Please give us a moment while we review the details of your request.",
  },
  {
    id: "greeting-returning",
    category: "Greetings",
    title: "Returning Customer",
    description:
      "Use when an existing customer returns for assistance.",
    response:
      "Welcome back to PropertySure AI Support. Thank you for contacting us again. How may we assist you today?",
    nextQuestion:
      "If the customer refers to a previous issue, what should we say?",
    nextResponse:
      "Certainly. We can continue from your previous request. Please confirm the details of the issue you would like us to assist with.",
  },
  {
    id: "greeting-reviewing",
    category: "Greetings",
    title: "Request Under Review",
    description:
      "Use when the support team needs time to review a request.",
    response:
      "Thank you for contacting PropertySure AI Support. We have received your request and are currently reviewing the details. We will assist you as soon as possible.",
    nextQuestion:
      "What if the customer asks how long the review will take?",
    nextResponse:
      "We are reviewing the information carefully to ensure we provide you with the correct assistance. We will update you once our review is complete.",
  },

  {
    id: "verification-how",
    category: "Property Verification",
    title: "How Property Verification Works",
    description:
      "Use when a customer asks how PropertySure verification works.",
    response:
      "PropertySure AI helps you assess and verify property documentation through a structured due diligence process. You can upload the available property documents, select the appropriate verification service, and our system will process the information for review.",
    nextQuestion:
      "What if the customer asks which documents are required?",
    nextResponse:
      "Depending on the property and verification level, relevant documents may include the Certificate of Occupancy, Deed of Assignment, Survey Plan, Allocation Letter, and other supporting property documents.",
  },
  {
    id: "verification-documents",
    category: "Property Verification",
    title: "Documents Required",
    description:
      "Use when a customer asks what documents they should provide.",
    response:
      "You can begin with the property documents you currently have available. Common documents include the Certificate of Occupancy, Deed of Assignment, Survey Plan, Allocation Letter, and other relevant supporting documents.",
    nextQuestion:
      "What if the customer does not have all the documents?",
    nextResponse:
      "That is okay. Please upload the documents you currently have and let us know which documents are unavailable. We can guide you on the next steps based on the property and verification requirements.",
  },
  {
    id: "verification-before-purchase",
    category: "Property Verification",
    title: "Verify Before Purchase",
    description:
      "Use when a customer asks whether they can verify before paying the seller.",
    response:
      "Yes. Property verification can be carried out before you complete the purchase. This can help you assess the available property documentation before proceeding with the transaction.",
    nextQuestion:
      "What should the customer do next?",
    nextResponse:
      "You can start by uploading the available property documents and selecting the verification service that matches the level of due diligence you require.",
  },
  {
    id: "verification-timeline",
    category: "Property Verification",
    title: "Verification Timeline",
    description:
      "Use when a customer asks how long verification takes.",
    response:
      "The verification timeline depends on the property, documents provided, verification level, and any external searches or checks that may be required.",
    nextQuestion:
      "What should we ask the customer?",
    nextResponse:
      "Please provide the property location and the documents currently available so we can guide you on the appropriate verification process.",
  },
  {
    id: "verification-missing",
    category: "Property Verification",
    title: "Missing Documents",
    description:
      "Use when a customer says they do not have all property documents.",
    response:
      "No problem. Please provide the property documents currently available to you. We will guide you on what additional information or documentation may be required.",
    nextQuestion:
      "What if the customer only has one document?",
    nextResponse:
      "You can still provide the document you have. Our team can review the available information and advise you on the next appropriate step.",
  },

  {
    id: "payment-instructions",
    category: "Payments",
    title: "Payment Instructions",
    description:
      "Use when a customer asks how to pay for a service.",
    response:
      "You can make your payment through the payment options provided during the PropertySure AI verification process. Please ensure that the selected service and amount are correct before completing the payment.",
    nextQuestion:
      "What if the customer has already made payment?",
    nextResponse:
      "Please provide the payment reference or transaction details so we can assist you in confirming the payment.",
  },
  {
    id: "payment-pending",
    category: "Payments",
    title: "Payment Pending",
    description:
      "Use when a customer's payment has not reflected yet.",
    response:
      "Thank you for letting us know. Your payment may still be processing. Please provide your payment reference or transaction details so our team can assist you with the verification.",
    nextQuestion:
      "What information should the customer provide?",
    nextResponse:
      "Please provide the transaction reference, payment date, amount paid, and the email address associated with your PropertySure AI account.",
  },
  {
    id: "payment-failed",
    category: "Payments",
    title: "Payment Failed",
    description:
      "Use when a customer reports a failed payment.",
    response:
      "We are sorry you experienced a problem with your payment. Please confirm the payment method you used and the error message you received, if any, so we can assist you.",
    nextQuestion:
      "What if the customer was charged despite the failed payment?",
    nextResponse:
      "Please provide the transaction reference and payment details. We will review the transaction status and guide you on the next step.",
  },

  {
    id: "account-login",
    category: "Account",
    title: "Login Problem",
    description:
      "Use when a customer cannot access their account.",
    response:
      "We can help you with your login issue. Please confirm the email address associated with your PropertySure AI account and describe what happens when you try to sign in.",
    nextQuestion:
      "What if the customer forgot their password?",
    nextResponse:
      "Please use the password reset option on the sign-in page. If you still cannot access your account after resetting your password, let us know and we will assist you further.",
  },
  {
    id: "account-registration",
    category: "Account",
    title: "Account Registration",
    description:
      "Use when a customer needs help creating an account.",
    response:
      "To use PropertySure AI, you can create an account using the registration option on the platform. Please provide the required information and use an active email address that you can access.",
    nextQuestion:
      "What if the customer cannot complete registration?",
    nextResponse:
      "Please tell us the step where the registration process stops and provide any error message displayed on your screen.",
  },
  {
    id: "account-email",
    category: "Account",
    title: "Account Email Issue",
    description:
      "Use when a customer has an issue with their registered email.",
    response:
      "We can assist with your account email issue. For security purposes, please provide the email address currently associated with your PropertySure AI account and explain what you need help changing or accessing.",
    nextQuestion:
      "What if the customer requests an email change?",
    nextResponse:
      "We will review the request and guide you through the appropriate account verification process before any account information is changed.",
  },

  {
    id: "technical-upload",
    category: "Technical",
    title: "Document Upload Problem",
    description:
      "Use when a customer cannot upload a document.",
    response:
      "We are sorry you are experiencing a problem uploading your document. Please check that the file is supported, readable, and within the permitted upload size, then try again.",
    nextQuestion:
      "What if the upload still fails?",
    nextResponse:
      "Please tell us the file type, approximate file size, and the error message displayed. If possible, also let us know which device and browser you are using.",
  },
  {
    id: "technical-processing",
    category: "Technical",
    title: "Verification Still Processing",
    description:
      "Use when a customer says their verification is taking too long.",
    response:
      "Thank you for reaching out. Your verification may require additional processing or review. We are checking the status and will guide you once we have more information.",
    nextQuestion:
      "What information should we confirm?",
    nextResponse:
      "Please provide your verification reference or the email address associated with the verification so we can identify the request.",
  },
  {
    id: "technical-error",
    category: "Technical",
    title: "Website Error",
    description:
      "Use when a customer reports an error on the platform.",
    response:
      "We are sorry about the issue you are experiencing. Please provide the page where the error occurred and the exact error message displayed so our team can investigate it.",
    nextQuestion:
      "What if the customer sends a screenshot?",
    nextResponse:
      "Thank you for providing the screenshot. We will review the information and investigate the issue further.",
  },

  {
    id: "security-suspicious",
    category: "Security & Fraud",
    title: "Suspicious Property",
    description:
      "Use when a customer suspects a property may be fraudulent.",
    response:
      "Thank you for bringing this to our attention. Please do not proceed with the transaction until the relevant property information and documentation have been properly reviewed.",
    nextQuestion:
      "What should the customer provide?",
    nextResponse:
      "Please provide the property location, available property documents, and any information or communication that caused you to suspect the transaction may be fraudulent.",
  },
  {
    id: "security-document",
    category: "Security & Fraud",
    title: "Suspicious Document",
    description:
      "Use when a customer believes a property document may be fraudulent.",
    response:
      "We understand your concern. Please provide the document and the relevant property information so our team can review the available information and guide you on the appropriate next step.",
    nextQuestion:
      "Should the customer continue the transaction?",
    nextResponse:
      "We recommend that you wait until the relevant documentation and property information have been properly reviewed before proceeding with the transaction.",
  },
  {
    id: "security-report",
    category: "Security & Fraud",
    title: "Report a Fraud Concern",
    description:
      "Use when a customer wants to report suspected fraud.",
    response:
      "Thank you for reporting this concern. We take property fraud and security issues seriously. Please provide as much relevant information as possible so our team can review the report.",
    nextQuestion:
      "What information is useful?",
    nextResponse:
      "Please provide the property location, names of the parties involved where appropriate, relevant documents, transaction information, and any messages or evidence connected to the concern.",
  },

  {
    id: "closing-resolved",
    category: "Closing",
    title: "Issue Resolved",
    description:
      "Use when the customer's issue has been resolved.",
    response:
      "We are glad we could assist you. If you have any other questions or need further assistance with PropertySure AI, please feel free to contact us.",
    nextQuestion:
      "What if the customer confirms everything is fine?",
    nextResponse:
      "Thank you for contacting PropertySure AI Support. We appreciate you using our service. Have a great day.",
  },
  {
    id: "closing-anything",
    category: "Closing",
    title: "Anything Else?",
    description:
      "Use before ending a conversation.",
    response:
      "Is there anything else we can assist you with today?",
    nextQuestion:
      "What if the customer says no?",
    nextResponse:
      "Thank you for contacting PropertySure AI Support. We appreciate your time and are always here to assist you when needed.",
  },
  {
    id: "closing-thank-you",
    category: "Closing",
    title: "Thank You",
    description:
      "Use as a professional final response.",
    response:
      "Thank you for contacting PropertySure AI Support. We appreciate your trust in PropertySure AI.",
    nextQuestion:
      "What if the customer has another question?",
    nextResponse:
      "Of course. Please let us know what you need assistance with, and we will be happy to help.",
  },
];

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "All",
  "Greetings",
  "Property Verification",
  "Payments",
  "Account",
  "Technical",
  "Security & Fraud",
  "Closing",
];

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCustomerName(conversation: Conversation) {
  return (
    conversation.customer_name?.trim() ||
    "PropertySure AI Customer"
  );
}

function getCustomerInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "C";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function shortenId(id: string) {
  if (!id) {
    return "—";
  }

  if (id.length <= 18) {
    return id;
  }

  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export default function SupportPage() {
  const [agentId, setAgentId] = useState("");
  const [agentEmail, setAgentEmail] = useState("");

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    SupportMessage[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(false);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const [error, setError] = useState("");

  const [templateCategory, setTemplateCategory] =
    useState<TemplateCategory>("All");

  const [templateSearch, setTemplateSearch] =
    useState("");

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string | null>(
      SUPPORT_TEMPLATES[0]?.id ?? null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);

  /*
   * ---------------------------------------------------------
   * FILTER RESPONSE TEMPLATES
   * ---------------------------------------------------------
   */

  const filteredTemplates = useMemo(() => {
    const search = templateSearch
      .trim()
      .toLowerCase();

    return SUPPORT_TEMPLATES.filter(
      (template) => {
        const categoryMatches =
          templateCategory === "All" ||
          template.category ===
            templateCategory;

        if (!categoryMatches) {
          return false;
        }

        if (!search) {
          return true;
        }

        return (
          template.title
            .toLowerCase()
            .includes(search) ||
          template.description
            .toLowerCase()
            .includes(search) ||
          template.response
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }, [
    templateCategory,
    templateSearch,
  ]);

  const selectedTemplate =
    SUPPORT_TEMPLATES.find(
      (template) =>
        template.id === selectedTemplateId
    ) ?? null;

  /*
   * ---------------------------------------------------------
   * LOAD SUPPORT AGENT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function loadAgent() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error(
            "You must be signed in to access support."
          );
        }

        const {
          data: agent,
          error: agentError,
        } = await supabase
          .from("support_agents")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (agentError) {
          throw agentError;
        }

        if (!agent) {
          throw new Error(
            "This account is not registered as a support agent."
          );
        }

        if (!mounted) {
          return;
        }

        setAgentId(user.id);
        setAgentEmail(user.email ?? "");
      } catch (err) {
        console.error(
          "Support agent loading error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load support account."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAgent();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD CONVERSATIONS
   * ---------------------------------------------------------
   */

  async function loadConversations() {
    setLoadingConversations(true);

    try {
      const {
        data,
        error: conversationsError,
      } = await supabase
        .from("support_conversations")
        .select(
          `
            id,
            user_id,
            customer_name,
            customer_email,
            status,
            subject,
            created_at,
            updated_at
          `
        )
        .order("updated_at", {
          ascending: false,
        });

      if (conversationsError) {
        throw conversationsError;
      }

      const rawConversations =
        (data ?? []) as Conversation[];

      const userIds = [
        ...new Set(
          rawConversations
            .map(
              (conversation) =>
                conversation.user_id
            )
            .filter(Boolean)
        ),
      ];

      let customerMap = new Map<
        string,
        CustomerDetails
      >();

      if (userIds.length > 0) {
        const {
          data: customerData,
          error: customerError,
        } = await supabase.rpc(
          "get_support_customer_details",
          {
            p_user_ids: userIds,
          }
        );

        if (customerError) {
          console.error(
            "Customer details RPC error:",
            customerError
          );
        } else {
          customerMap = new Map(
            (
              (customerData ??
                []) as CustomerDetails[]
            ).map((customer) => [
              customer.user_id,
              customer,
            ])
          );
        }
      }

      /*
       * Auth details have priority over any
       * old placeholder values.
       */
      const enrichedConversations =
        rawConversations.map(
          (conversation) => {
            const customer =
              customerMap.get(
                conversation.user_id
              );

            return {
              ...conversation,

              customer_name:
                customer?.customer_name?.trim() ||
                conversation.customer_name?.trim() ||
                null,

              customer_email:
                customer?.email?.trim() ||
                conversation.customer_email?.trim() ||
                null,
            };
          }
        );

      setConversations(
        enrichedConversations
      );

      setSelectedConversationId(
        (current) => {
          if (
            current &&
            enrichedConversations.some(
              (conversation) =>
                conversation.id === current
            )
          ) {
            return current;
          }

          return (
            enrichedConversations[0]?.id ??
            null
          );
        }
      );
    } catch (err) {
      console.error(
        "Conversation loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * INITIAL CONVERSATION LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!agentId) {
      return;
    }

    loadConversations();
  }, [agentId]);

  /*
   * ---------------------------------------------------------
   * REALTIME SUPPORT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!agentId) {
      return;
    }

    const channel = supabase
      .channel(
        "propertysure-admin-support"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_conversations",
        },
        async () => {
          await loadConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        async (
          payload: RealtimeMessagePayload
        ) => {
          const incoming = payload.new;

          if (
            incoming.conversation_id ===
            selectedConversationId
          ) {
            setMessages((current) => {
              const alreadyExists =
                current.some(
                  (item) =>
                    item.id ===
                    incoming.id
                );

              if (alreadyExists) {
                return current;
              }

              return [
                ...current,
                incoming,
              ];
            });
          }

          await loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    agentId,
    selectedConversationId,
  ]);

  /*
   * ---------------------------------------------------------
   * LOAD MESSAGES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    async function loadMessages() {
      setLoadingMessages(true);

      try {
        const {
          data,
          error: messagesError,
        } = await supabase
          .from("support_messages")
          .select(
            `
              id,
              conversation_id,
              sender_id,
              sender_type,
              message,
              created_at
            `
          )
          .eq(
            "conversation_id",
            selectedConversationId
          )
          .order("created_at", {
            ascending: true,
          });

        if (messagesError) {
          throw messagesError;
        }

        if (mounted) {
          setMessages(
            (data ?? []) as SupportMessage[]
          );
        }
      } catch (err) {
        console.error(
          "Message loading error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load messages."
          );
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [selectedConversationId]);

  /*
   * ---------------------------------------------------------
   * USE TEMPLATE
   * ---------------------------------------------------------
   */

  function handleUseTemplate(
    template: SupportTemplate
  ) {
    setMessage(template.response);
    setSelectedTemplateId(template.id);

    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        template.response.length,
        template.response.length
      );
    }, 50);
  }

  /*
   * ---------------------------------------------------------
   * SEND SUPPORT MESSAGE
   * ---------------------------------------------------------
   */

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      !selectedConversationId ||
      !agentId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const selectedConversation =
        conversations.find(
          (conversation) =>
            conversation.id ===
            selectedConversationId
        );

      if (
        !selectedConversation ||
        selectedConversation.status ===
          "closed"
      ) {
        throw new Error(
          "This conversation is closed."
        );
      }

      const {
        error: insertError,
      } = await supabase
        .from("support_messages")
        .insert({
          conversation_id:
            selectedConversationId,
          sender_id: agentId,
          sender_type: "support",
          message: trimmedMessage,
        });

      if (insertError) {
        throw insertError;
      }

      await supabase
        .from("support_conversations")
        .update({
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          selectedConversationId
        );

      setMessage("");

      const {
        data,
        error: reloadError,
      } = await supabase
        .from("support_messages")
        .select(
          `
            id,
            conversation_id,
            sender_id,
            sender_type,
            message,
            created_at
          `
        )
        .eq(
          "conversation_id",
          selectedConversationId
        )
        .order("created_at", {
          ascending: true,
        });

      if (!reloadError) {
        setMessages(
          (data ?? []) as SupportMessage[]
        );
      }

      await loadConversations();
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * CLOSE CONVERSATION
   * ---------------------------------------------------------
   */

  async function handleCloseConversation() {
    if (
      !selectedConversationId ||
      closing
    ) {
      return;
    }

    setClosing(true);
    setError("");

    try {
      const {
        error: updateError,
      } = await supabase
        .from("support_conversations")
        .update({
          status: "closed",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          selectedConversationId
        );

      if (updateError) {
        throw updateError;
      }

      await loadConversations();
    } catch (err) {
      console.error(
        "Close conversation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to close conversation."
      );
    } finally {
      setClosing(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const totalConversations =
    conversations.length;

  const openConversations =
    conversations.filter(
      (conversation) =>
        conversation.status === "open"
    ).length;

  const closedConversations =
    conversations.filter(
      (conversation) =>
        conversation.status === "closed"
    ).length;

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    ) ?? null;

  const selectedCustomerName =
    selectedConversation
      ? getCustomerName(
          selectedConversation
        )
      : "Customer";

  const selectedCustomerInitials =
    getCustomerInitials(
      selectedCustomerName
    );

  const selectedCustomerEmail =
    selectedConversation?.customer_email?.trim() ||
    "Email unavailable";

  const selectedCustomerId =
    selectedConversation?.user_id ||
    "—";

  const selectedConversationStatus =
    selectedConversation?.status ??
    "open";

  const sortedMessages = useMemo(
    () => messages,
    [messages]
  );

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div
              className={styles.loadingSpinner}
            />
            <span>
              Loading support dashboard...
            </span>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR / UNAUTHORIZED
   * ---------------------------------------------------------
   */

  if (!agentId) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            {error ||
              "You are not authorized to access support."}
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN SUPPORT DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerIntro}>
            <div className={styles.eyebrow}>
              PropertySure AI
            </div>

            <h1 className={styles.title}>
              Support Center
            </h1>

            <p className={styles.subtitle}>
              Manage customer conversations,
              respond professionally, and use
              approved support guidance from one
              workspace.
            </p>
          </div>

          <div className={styles.agentCard}>
            <div className={styles.agentStatus}>
              <span
                className={styles.statusDot}
                aria-hidden="true"
              />

              <span>
                Support online
              </span>
            </div>

            <span className={styles.agentEmail}>
              {agentEmail}
            </span>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className={styles.errorBox}>
            {error}
          </div>
        )}

        {/* STATS */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Total conversations
            </span>

            <strong className={styles.statValue}>
              {totalConversations}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Open
            </span>

            <strong className={styles.statValue}>
              {openConversations}
            </strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              Closed
            </span>

            <strong className={styles.statValue}>
              {closedConversations}
            </strong>
          </div>
        </section>

        {/* MAIN WORKSPACE */}
        <section className={styles.workspace}>
          {/* =================================================
              CONVERSATIONS
          ================================================= */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div>
                <h2>Conversations</h2>

                <span>
                  {openConversations} open
                </span>
              </div>

              <span className={styles.sidebarBadge}>
                Live
              </span>
            </div>

            <div className={styles.conversationList}>
              {loadingConversations ? (
                <div className={styles.emptyState}>
                  <div
                    className={
                      styles.smallSpinner
                    }
                  />

                  <p>
                    Loading conversations...
                  </p>
                </div>
              ) : conversations.length ===
                0 ? (
                <div className={styles.emptyState}>
                  <div
                    className={
                      styles.emptyIcon
                    }
                  >
                    💬
                  </div>

                  <h3>
                    No conversations yet
                  </h3>

                  <p>
                    Customer conversations
                    will appear here when
                    support requests are
                    received.
                  </p>
                </div>
              ) : (
                conversations.map(
                  (conversation) => {
                    const customerName =
                      getCustomerName(
                        conversation
                      );

                    const initials =
                      getCustomerInitials(
                        customerName
                      );

                    const isSelected =
                      conversation.id ===
                      selectedConversationId;

                    return (
                      <button
                        key={
                          conversation.id
                        }
                        type="button"
                        className={`${styles.conversationItem} ${
                          isSelected
                            ? styles.conversationItemActive
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedConversationId(
                            conversation.id
                          )
                        }
                      >
                        <div
                          className={
                            styles.conversationAvatar
                          }
                        >
                          {initials}
                        </div>

                        <div
                          className={
                            styles.conversationInfo
                          }
                        >
                          <div
                            className={
                              styles.conversationTop
                            }
                          >
                            <strong>
                              {
                                customerName
                              }
                            </strong>

                            <span>
                              {formatTime(
                                conversation.updated_at
                              )}
                            </span>
                          </div>

                          <div
                            className={
                              styles.customerEmail
                            }
                          >
                            {conversation.customer_email ||
                              "Email unavailable"}
                          </div>

                          <div
                            className={
                              styles.customerId
                            }
                          >
                            ID:{" "}
                            {shortenId(
                              conversation.user_id
                            )}
                          </div>

                          <div
                            className={
                              styles.conversationBottom
                            }
                          >
                            <span>
                              {conversation.subject ||
                                "Support request"}
                            </span>

                            <span
                              className={
                                conversation.status ===
                                "open"
                                  ? styles.openBadge
                                  : styles.closedBadge
                              }
                            >
                              {
                                conversation.status
                              }
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </aside>

          {/* =================================================
              CUSTOMER CHAT
          ================================================= */}
          <section className={styles.chatPanel}>
            {!selectedConversation ? (
              <div className={styles.noSelection}>
                <div
                  className={
                    styles.noSelectionIcon
                  }
                >
                  💬
                </div>

                <h2>
                  Select a conversation
                </h2>

                <p>
                  Choose a customer
                  conversation from the left
                  to begin providing support.
                </p>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <header className={styles.chatHeader}>
                  <div className={styles.customerInfo}>
                    <div
                      className={
                        styles.largeCustomerAvatar
                      }
                    >
                      {
                        selectedCustomerInitials
                      }
                    </div>

                    <div className={styles.customerIdentity}>
                      <h2>
                        {
                          selectedCustomerName
                        }
                      </h2>

                      <div
                        className={
                          styles.customerEmailLarge
                        }
                      >
                        {
                          selectedCustomerEmail
                        }
                      </div>

                      <div
                        className={
                          styles.customerIdLarge
                        }
                      >
                        Customer ID:{" "}
                        {
                          selectedCustomerId
                        }
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      styles.chatActions
                    }
                  >
                    <span
                      className={
                        selectedConversationStatus ===
                        "open"
                          ? styles.openBadgeLarge
                          : styles.closedBadgeLarge
                      }
                    >
                      {
                        selectedConversationStatus
                      }
                    </span>

                    {selectedConversationStatus ===
                      "open" && (
                      <button
                        type="button"
                        className={
                          styles.closeButton
                        }
                        onClick={
                          handleCloseConversation
                        }
                        disabled={
                          closing
                        }
                      >
                        {closing
                          ? "Closing..."
                          : "Close conversation"}
                      </button>
                    )}
                  </div>
                </header>

                {/* MESSAGES */}
                <div className={styles.messages}>
                  {loadingMessages ? (
                    <div
                      className={
                        styles.messagesLoading
                      }
                    >
                      <div
                        className={
                          styles.smallSpinner
                        }
                      />

                      <span>
                        Loading messages...
                      </span>
                    </div>
                  ) : sortedMessages.length ===
                    0 ? (
                    <div
                      className={
                        styles.noMessages
                      }
                    >
                      No messages yet.
                    </div>
                  ) : (
                    sortedMessages.map(
                      (item) => {
                        const isSupport =
                          item.sender_type ===
                          "support";

                        return (
                          <div
                            key={item.id}
                            className={`${styles.messageRow} ${
                              isSupport
                                ? styles.messageRowSupport
                                : styles.messageRowCustomer
                            }`}
                          >
                            <div
                              className={`${styles.messageBubble} ${
                                isSupport
                                  ? styles.supportBubble
                                  : styles.customerBubble
                              }`}
                            >
                              <div
                                className={
                                  styles.messageSender
                                }
                              >
                                {isSupport
                                  ? "PropertySure Support"
                                  : selectedCustomerName}
                              </div>

                              <div
                                className={
                                  styles.messageText
                                }
                              >
                                {
                                  item.message
                                }
                              </div>

                              <div
                                className={
                                  styles.messageTime
                                }
                              >
                                {formatTime(
                                  item.created_at
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>

                {/* COMPOSER */}
                <form
                  className={
                    styles.messageForm
                  }
                  onSubmit={
                    handleSendMessage
                  }
                >
                  {selectedConversationStatus ===
                  "closed" ? (
                    <div
                      className={
                        styles.closedComposer
                      }
                    >
                      <strong>
                        This conversation is
                        closed.
                      </strong>

                      <span>
                        Reopen or start a new
                        support conversation
                        if further assistance
                        is required.
                      </span>
                    </div>
                  ) : (
                    <>
                      <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(
                          event
                        ) =>
                          setMessage(
                            event.target
                              .value
                          )
                        }
                        placeholder="Write a reply or select a response template..."
                        rows={3}
                        disabled={
                          sending
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();

                            event.currentTarget.form?.requestSubmit();
                          }
                        }}
                      />

                      <div
                        className={
                          styles.composerFooter
                        }
                      >
                        <span>
                          Enter to send •
                          Shift + Enter
                          for a new line
                        </span>

                        <button
                          type="submit"
                          disabled={
                            sending ||
                            !message.trim()
                          }
                          className={
                            styles.sendButton
                          }
                        >
                          {sending
                            ? "Sending..."
                            : "Send reply"}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </>
            )}
          </section>

          {/* =================================================
              RESPONSE LIBRARY
          ================================================= */}
          <aside
            className={
              styles.templatePanel
            }
          >
            <div
              className={
                styles.templateHeader
              }
            >
              <div>
                <div
                  className={
                    styles.templateEyebrow
                  }
                >
                  Staff Playbook
                </div>

                <h2>
                  Response Library
                </h2>

                <p>
                  Approved responses for
                  consistent customer support.
                </p>
              </div>

              <span
                className={
                  styles.templateCount
                }
              >
                {SUPPORT_TEMPLATES.length}
              </span>
            </div>

            {/* SEARCH */}
            <div
              className={
                styles.templateSearch
              }
            >
              <span aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                value={templateSearch}
                onChange={(event) =>
                  setTemplateSearch(
                    event.target.value
                  )
                }
                placeholder="Search responses..."
                aria-label="Search response templates"
              />
            </div>

            {/* CATEGORIES */}
            <div
              className={
                styles.templateCategories
              }
            >
              {TEMPLATE_CATEGORIES.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      templateCategory ===
                      category
                        ? styles.templateCategoryActive
                        : styles.templateCategory
                    }
                    onClick={() =>
                      setTemplateCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>
                )
              )}
            </div>

            {/* TEMPLATE LIST */}
            <div
              className={
                styles.templateList
              }
            >
              {filteredTemplates.length ===
              0 ? (
                <div
                  className={
                    styles.templateEmpty
                  }
                >
                  <span>⌕</span>

                  <strong>
                    No responses found
                  </strong>

                  <p>
                    Try another search or
                    category.
                  </p>
                </div>
              ) : (
                filteredTemplates.map(
                  (template) => {
                    const selected =
                      template.id ===
                      selectedTemplateId;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        className={`${styles.templateItem} ${
                          selected
                            ? styles.templateItemActive
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedTemplateId(
                            template.id
                          )
                        }
                      >
                        <span
                          className={
                            styles.templateItemCategory
                          }
                        >
                          {
                            template.category
                          }
                        </span>

                        <strong>
                          {template.title}
                        </strong>

                        <span
                          className={
                            styles.templateItemDescription
                          }
                        >
                          {
                            template.description
                          }
                        </span>
                      </button>
                    );
                  }
                )
              )}
            </div>

            {/* SELECTED TEMPLATE */}
            {selectedTemplate && (
              <div
                className={
                  styles.templateDetail
                }
              >
                <div
                  className={
                    styles.templateDetailTop
                  }
                >
                  <span>
                    {
                      selectedTemplate.category
                    }
                  </span>

                  <strong>
                    {
                      selectedTemplate.title
                    }
                  </strong>
                </div>

                <div
                  className={
                    styles.templateResponse
                  }
                >
                  <span>
                    Approved response
                  </span>

                  <p>
                    {
                      selectedTemplate.response
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    styles.useTemplateButton
                  }
                  onClick={() =>
                    handleUseTemplate(
                      selectedTemplate
                    )
                  }
                  disabled={
                    selectedConversationStatus ===
                    "closed"
                  }
                >
                  Use this response
                </button>

                <div
                  className={
                    styles.nextStepCard
                  }
                >
                  <span>
                    Suggested next question
                  </span>

                  <p>
                    {
                      selectedTemplate.nextQuestion
                    }
                  </p>
                </div>

                <div
                  className={
                    styles.nextStepCard
                  }
                >
                  <span>
                    Recommended follow-up
                  </span>

                  <p>
                    {
                      selectedTemplate.nextResponse
                    }
                  </p>
                </div>
              </div>
            )}
          </aside>
        </section>

        {/* FOOTER */}
        <div className={styles.footerNote}>
          <span className={styles.footerDot} />

          <span>
            Support workspace • Supabase
            authentication and RLS
            protected
          </span>
        </div>
      </div>
    </main>
  );
}