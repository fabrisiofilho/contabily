import { assistantEnabled } from '../../../../../../shared/assistantAvailability';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import {
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseAssistantDraft } from '../../../../../../shared/assistantDraft';

export function TransactionActions() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const dialogId = useId();
  const titleId = useId();
  const navigate = useNavigate();
  return (
    <>
      {assistantEnabled && (
        <>
          <Tooltip title="Assistente de lançamentos">
            <IconButton
              size="small"
              aria-label="Abrir assistente de lançamentos"
              aria-haspopup="dialog"
              aria-expanded={Boolean(anchor)}
              aria-controls={anchor ? dialogId : undefined}
              onClick={(event) => setAnchor(event.currentTarget)}
            >
              <MicNoneOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(anchor)}
            anchorEl={anchor}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                id: dialogId,
                role: 'dialog',
                'aria-labelledby': titleId,
              },
            }}
          >
            <Stack
              component="form"
              spacing={1.5}
              sx={{ p: 2, width: 'min(340px, calc(100vw - 32px))' }}
              onSubmit={(event) => {
                event.preventDefault();
                const draft = parseAssistantDraft(text);
                if (!draft) {
                  setInvalid(true);
                  return;
                }
                setAnchor(null);
                setText('');
                setInvalid(false);
                navigate('/panel/transactions?new=' + draft.type, {
                  state: { assistantDraft: draft },
                });
              }}
            >
              <Typography id={titleId} variant="subtitle1">
                Assistente de lançamentos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A escuta direta está indisponível. Digite ou use o ditado do
                Windows neste campo.
              </Typography>
              <TextField
                autoFocus
                size="small"
                label="Comando"
                value={text}
                error={invalid}
                onChange={(event) => {
                  setText(event.target.value);
                  setInvalid(false);
                }}
                helperText={
                  invalid
                    ? 'Nenhum lançamento aberto. Tente “gastei 50 reais no mercado”.'
                    : 'Exemplo: gastei 50 reais no mercado.'
                }
                slotProps={{
                  htmlInput: { maxLength: 180 },
                  formHelperText: { role: invalid ? 'alert' : undefined },
                }}
              />
              <Button type="submit" variant="contained" disabled={!text.trim()}>
                Revisar lançamento
              </Button>
            </Stack>
          </Popover>
        </>
      )}
      <Button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent('quick-transaction', { detail: 'income' }),
          )
        }
        data-tour="income-create"
        color="success"
        size="small"
      >
        Nova receita
      </Button>
      <Button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent('quick-transaction', { detail: 'expense' }),
          )
        }
        data-tour="expense-create"
        color="error"
        size="small"
        variant="outlined"
      >
        Nova despesa
      </Button>
    </>
  );
}
