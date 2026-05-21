import React, { useCallback, useRef, useState } from 'react';
import { SoftReviewPrompt } from '../components/SoftReviewPrompt';
import { shouldShowSoftPrompt } from '../services/reviewPromptService';

interface UseSoftReviewPromptResult {
  /**
   * Show the prompt if the cooldown has elapsed. If not eligible, the
   * `onComplete` callback fires immediately so the caller can continue
   * its flow (e.g. navigation). If eligible, `onComplete` fires after
   * the user closes the prompt.
   *
   * Returns true if the prompt was shown, false if skipped by cooldown.
   */
  showIfEligible: (onComplete?: () => void) => Promise<boolean>;
  /** Render this in your JSX tree to mount the modal. */
  promptElement: React.ReactElement;
}

export const useSoftReviewPrompt = (
  trigger: string,
): UseSoftReviewPromptResult => {
  const [visible, setVisible] = useState(false);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const showIfEligible = useCallback(
    async (onComplete?: () => void): Promise<boolean> => {
      const eligible = await shouldShowSoftPrompt();
      if (!eligible) {
        onComplete?.();
        return false;
      }
      onCompleteRef.current = onComplete ?? null;
      setVisible(true);
      return true;
    },
    [],
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    const cb = onCompleteRef.current;
    onCompleteRef.current = null;
    cb?.();
  }, []);

  const promptElement = React.createElement(SoftReviewPrompt, {
    visible,
    trigger,
    onClose: handleClose,
  });

  return { showIfEligible, promptElement };
};
