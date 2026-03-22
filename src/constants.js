/** Set to `false` for production: restores 500 char max + 3s client cooldown */
export const TESTING_NO_LIMITS = true;

export const MAX_CHARS = TESTING_NO_LIMITS ? 50000 : 500;
export const COOLDOWN_MS = TESTING_NO_LIMITS ? 0 : 3000;

/** Suggestion chips — Corporate → Straight Talk */
export const CORPORATE_SPEAK_SUGGESTIONS = [
  "Let's circle back",
  "Let's align cross-functionally before moving forward",
  "We should double-click on that and unpack the details",
  "Let's not boil the ocean here",
  "Can we socialize this with stakeholders",
  "We need to operationalize a scalable solution",
  "Let's zoom out and anchor on the north star",
  "We're exploring a few strategic options at the moment",
  "Let's create a framework to drive alignment across teams",
  "We should prioritize high-impact initiatives that move the needle",
];

/** Suggestion chips — Straight Talk → Corporate */
export const STRAIGHT_TALK_SUGGESTIONS = [
  "I have no idea what's going on",
  "We're just talking in circles",
  "This meeting could have been a Slack message",
  "Bitch, what?",
  "We're making this way more complicated than it needs to be",
  "Nothing is actually happening right now",
  "The f are you talking about?",
  "We're stuck and nobody wants to say it",
  "Wait… what are you even saying right now?",
  "This is not going to work",
];
