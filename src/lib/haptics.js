export const haptics = {
  light: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(15); } catch (e) {}
    }
  },
  medium: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(35); } catch (e) {}
    }
  },
  countdown: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate(45); } catch (e) {}
    }
  },
  success: () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try { navigator.vibrate([50, 70, 150]); } catch (e) {}
    }
  }
};
