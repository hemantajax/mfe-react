/**
 * Remote Entry Point for reactdemos
 * This file exposes the main App component to be consumed by the host application
 *
 * Usage in host:
 * import('reactdemos/Module').then(module => {
 *   const App = module.default;
 *   // Use the App component
 * });
 */

export { default } from './app/app';
export * from './app/app';
