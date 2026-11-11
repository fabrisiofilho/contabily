import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import { useState } from 'react';
import { Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ContentSurface, PageContainer } from '@renderer/components/PageLayout';
import {
  assistantExamples,
  parseAssistantDestination,
  parseAssistantDraft,
} from '../../../shared/assistantDraft';

const routes = {
  home: '/panel/dashboard',
  entries: '/panel/transactions',
  accounts: '/panel/accounts',
  cards: '/panel/credit-cards',
  reports: '/panel/reports',
  cashFlow: '/panel/cash-flow',
};

export function AssistantPage() {
  const [command, setCommand] = useState('');
  const [invalid, setInvalid] = useState(false);
  const navigate = useNavigate();

  function executeCommand(text: string): void {
    const destination = parseAssistantDestination(text);
    if (destination) {
      navigate(routes[destination]);
      return;
    }
    const draft = parseAssistantDraft(text);
    if (!draft) {
      setInvalid(true);
      return;
    }
    navigate('/panel/transactions?new=' + draft.type, {
      state: { assistantDraft: draft },
    });
  }

  return (
    <PageContainer>
      <Stack spacing={3} maxWidth={760} mx="auto">
        <Typography variant="h4" component="h1">
          Assistente
        </Typography>
        <ContentSurface>
          <Stack
            component="form"
            spacing={2}
            sx={{ p: { xs: 2, sm: 3 } }}
            onSubmit={(event) => {
              event.preventDefault();
              executeCommand(command);
            }}
          >
            <Stack alignItems="center" spacing={1.25} textAlign="center" py={2}>
              <MicNoneOutlinedIcon
                color="primary"
                aria-hidden="true"
                sx={{ fontSize: 48 }}
              />
              <Typography variant="h6" component="h2">
                Como posso ajudar?
              </Typography>
              <Typography color="text.secondary">
                Use o ditado do sistema no campo abaixo ou digite seu comando.
              </Typography>
            </Stack>
            <Typography variant="h6" component="h2">
              Novo lançamento
            </Typography>
            <Typography color="text.secondary">
              Digite ou use o ditado do teclado. Depois, revise os dados no
              formulário.
            </Typography>
            <TextField
              label="Comando"
              value={command}
              onChange={(event) => {
                setCommand(event.target.value);
                setInvalid(false);
              }}
              error={invalid}
              helperText={
                invalid
                  ? 'Nenhuma ação foi executada. Tente “gastei 50 reais no mercado” ou “abrir extrato”.'
                  : 'Exemplos: acabei de gastar 50 reais no mercado ou recebi 1500 reais de salário. Para navegar, tente abrir extrato.'
              }
              FormHelperTextProps={{ role: invalid ? 'alert' : undefined }}
              slotProps={{ htmlInput: { maxLength: 180 } }}
            />
            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
              {assistantExamples.map((example) => (
                <Chip
                  key={example.label}
                  label={example.label}
                  variant="outlined"
                  onClick={() => {
                    setCommand(example.command);
                    setInvalid(false);
                  }}
                />
              ))}
            </Stack>
            <Button
              type="submit"
              variant="contained"
              disabled={!command.trim()}
              sx={{ alignSelf: 'flex-start' }}
            >
              Executar comando
            </Button>
          </Stack>
        </ContentSurface>
        <ContentSurface>
          <Stack spacing={1.5} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" component="h2">
              Acesso rápido
            </Typography>
            <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
              <Button
                component={Link}
                to="/panel/transactions"
                variant="outlined"
              >
                Transações
              </Button>
              <Button component={Link} to="/panel/accounts" variant="outlined">
                Contas
              </Button>
              <Button component={Link} to="/panel/reports" variant="outlined">
                Relatórios
              </Button>
            </Stack>
          </Stack>
        </ContentSurface>
      </Stack>
    </PageContainer>
  );
}
