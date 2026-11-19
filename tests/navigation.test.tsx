import { fireEvent, waitFor, act } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { router } from 'expo-router';
import Root from '../app/_layout';
import Login from '../app/index';
import Cadastro from '../app/cadastro';
import Main from '../app/(main)/_layout';
import Tabs from '../app/(main)/(tabs)/_layout';
import Home from '../app/(main)/(tabs)/home';
import Tasks from '../app/(main)/(tabs)/tarefas';
import Planning from '../app/(main)/(tabs)/planejamento';
import Focus from '../app/(main)/(tabs)/foco';
import Profile from '../app/(main)/(tabs)/perfil';
import Form from '../app/(main)/novaTarefa';
import Categories from '../app/(main)/categorias';
import { sessionStorage } from '../src/services/sessionStorage';

jest.mock('../src/services/sessionStorage', () => ({
  sessionStorage: { read: jest.fn(async () => null), write: jest.fn(async () => undefined) },
}));
const routes = {
  _layout: Root, index: Login, cadastro: Cadastro,
  '(main)/_layout': Main, '(main)/(tabs)/_layout': Tabs,
  '(main)/(tabs)/home': Home, '(main)/(tabs)/tarefas': Tasks,
  '(main)/(tabs)/planejamento': Planning, '(main)/(tabs)/foco': Focus,
  '(main)/(tabs)/perfil': Profile, '(main)/novaTarefa': Form,
  '(main)/editarTarefa': Form, '(main)/categorias': Categories,
};
const user = { id: 1, nome: 'DEMO Teste', email: 'teste@demo.invalid', token: 'test-token', server: 'http://localhost:8080' };
const fetchMock = jest.fn();
beforeEach(() => {
  jest.mocked(sessionStorage.read).mockResolvedValue(null);
  global.fetch = fetchMock;
  fetchMock.mockReset().mockImplementation(async (url: string) => ({
    ok: true, status: 200, json: async () => url.endsWith('/login') ? user : [],
  }));
});
test('login real da interface protege rotas e abre as cinco áreas', async () => {
  const navigation = renderRouter(routes, { initialUrl: '/home' });
  await screen.findByText('Bem-vindo de volta');
  expect(screen.queryByLabelText('Servidor')).toBeNull();
  expect(screen.queryByText('Seu dia, com mais intenção.')).toBeNull();
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'teste@demo.invalid');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'test-password');
  fireEvent.press(screen.getByLabelText('Entrar'));
  await screen.findByText('Seu dia, com mais intenção.');
  await waitFor(() => expect(navigation.getPathname()).toBe('/home'));
  expect(sessionStorage.write).toHaveBeenCalledWith({ ...user, server: 'https://organizaai.evox.net.br' });
  for (const [path, title] of [
    ['/tarefas', 'Suas tarefas'], ['/planejamento', 'Planeje com clareza.'],
    ['/foco', 'Uma coisa de cada vez.'], ['/perfil', 'Seu espaço.'],
  ] as const) {
    act(() => router.navigate(path));
    await screen.findByText(title);
  }
}, 15000);
test('formulário envia tarefa e checklist pelo serviço HTTP e volta à lista', async () => {
  jest.mocked(sessionStorage.read).mockResolvedValue(user);
  renderRouter(routes, { initialUrl: '/home' });
  await screen.findByText('Seu dia, com mais intenção.');
  act(() => router.push('/novaTarefa'));
  await screen.findByLabelText('Título');
  fireEvent.changeText(screen.getByLabelText('Título'), 'DEMO Tarefa de teste');
  fireEvent.press(screen.getByLabelText('Abrir Checklist e notas'));
  fireEvent.press(screen.getByLabelText('Adicionar etapa'));
  fireEvent.changeText(screen.getByLabelText('Título da etapa 1'), 'Revisar apresentação');
  fireEvent.press(screen.getByLabelText('Salvar tarefa'));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    'https://organizaai.evox.net.br/api/tarefas?usuarioId=1', expect.objectContaining({
      method: 'POST', body: expect.stringContaining('Revisar apresentação'),
    })));
});
test('falha de login permanece na tela e exibe mensagem', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
  renderRouter(routes, { initialUrl: '/' });
  await screen.findByText('Bem-vindo de volta');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'teste@demo.invalid');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'incorreta');
  fireEvent.press(screen.getByLabelText('Entrar'));
  await screen.findByText('E-mail ou senha incorretos.');
  expect(screen.queryByText('Seu dia, com mais intenção.')).toBeNull();
});
