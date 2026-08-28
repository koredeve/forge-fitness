"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import ProModal from "./ProModal";

export default function GlobalModals() {
  const { authModalState, closeAuthModal, proModalState, closeProModal } = useAuth();

  return (
    <>
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuthModal}
        subtitle={authModalState.subtitle}
        defaultMode={authModalState.defaultMode}
      />
      <ProModal
        isOpen={proModalState.isOpen}
        onClose={closeProModal}
        featureName={proModalState.featureName}
      />
    </>
  );
}
