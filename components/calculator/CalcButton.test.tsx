import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { CalcButton } from "./CalcButton";
import { FeaturesProvider } from "@/hooks/useFeatures";
import { ToastProvider } from "@/components/ui/Toast";
import type { FeatureSlug } from "@/types/features";

// FeaturesProvider calls useRouter().refresh(); stub the navigation module.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

function renderButton(
  props: React.ComponentProps<typeof CalcButton>,
  unlocked: FeatureSlug[] = [],
) {
  return render(
    <ToastProvider>
      <FeaturesProvider initialUnlocked={unlocked} isLoggedIn={false}>
        <CalcButton {...props} />
      </FeaturesProvider>
    </ToastProvider>,
  );
}

describe("CalcButton", () => {
  it("activates a free (ungated) button", () => {
    const onActivate = vi.fn();
    renderButton({ label: "7", ariaLabel: "Seven", onActivate });
    fireEvent.click(screen.getByRole("button", { name: "Seven" }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("does NOT activate a locked gated button", () => {
    const onActivate = vi.fn();
    renderButton({
      label: "×",
      ariaLabel: "Multiply",
      onActivate,
      featureSlug: "multiplication",
    });
    // aria-label reflects the locked state.
    const btn = screen.getByRole("button", { name: /Multiply — locked/i });
    fireEvent.click(btn);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("activates a gated button once the feature is unlocked", () => {
    const onActivate = vi.fn();
    renderButton(
      { label: "×", ariaLabel: "Multiply", onActivate, featureSlug: "multiplication" },
      ["multiplication"],
    );
    fireEvent.click(screen.getByRole("button", { name: "Multiply" }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});