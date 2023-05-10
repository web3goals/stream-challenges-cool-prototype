import { Dialog, Typography } from "@mui/material";
import { DialogCenterContent } from "components/styled";
import { useState } from "react";

/**
 * Dialog to finish a crossbell stream.
 *
 * TODO: Implement
 */
export default function CrossbellStreamFinishDialog(props: {
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
  // Dialog states
  const [isOpen, setIsOpen] = useState(!props.isClose);

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🏁 Attach recording
        </Typography>
        <Typography textAlign="center" mt={1}>
          to finish stream and earn points for the leaderboard
        </Typography>
      </DialogCenterContent>
    </Dialog>
  );
}
