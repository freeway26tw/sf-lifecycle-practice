import type { RouteObject } from 'react-router';
import AgentExplorerApp from './agent-explorer/AgentExplorerApp';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AgentExplorerApp />,
    handle: { showInNavigation: true, label: 'Agent Explorer' },
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
