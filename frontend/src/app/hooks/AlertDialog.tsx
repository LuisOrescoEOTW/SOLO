import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface AlertDialogProps {
  open: boolean;
  onClose: (result: boolean) => void; // Cambiado para aceptar un valor booleano
  mensaje: string;
}

export default function AlertDialog({ open, onClose, mensaje }: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)} // Cierra el modal y retorna "false"
      disableEnforceFocus
      disableRestoreFocus
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{mensaje}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          ¿Confirma la acción?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => {(e.currentTarget as HTMLButtonElement).blur(); onClose(false)}} variant="contained" color="error">
          No
        </Button>
        <Button onClick={(e) => {(e.currentTarget as HTMLButtonElement).blur(); onClose(true)}} variant="contained" color="success" autoFocus>
          Sí
        </Button>
      </DialogActions>
    </Dialog>
  );
}

