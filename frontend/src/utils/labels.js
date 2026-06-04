// Hebrew labels for the backend's English enum values. The API always speaks
// English; these maps are for DISPLAY only. When sending data we keep the
// English keys (e.g. a <select> option's `value` stays "given").

export const directionLabels = {
  given: "נתתי",
  received: "קיבלתי",
};

export const eventTypeLabels = {
  wedding: "חתונה",
  bar_mitzvah: "בר מצווה",
  brit: "ברית",
  birthday: "יום הולדת",
  other: "אחר",
};

export const relationLabels = {
  family: "משפחה",
  friend: "חבר",
  work: "עבודה",
  other: "אחר",
};

// Ordered [value, label] pairs for building <select> options.
export const directionOptions = Object.entries(directionLabels);
export const eventTypeOptions = Object.entries(eventTypeLabels);
export const relationOptions = Object.entries(relationLabels);
