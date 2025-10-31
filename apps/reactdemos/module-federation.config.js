/**
 * Module Federation configuration for reactdemos remote application
 * This exposes the Module entry point to be consumed by the host application
 */
module.exports = {
  name: 'reactdemos',

  /**
   * Expose the remote entry point
   * The host application will import this as: import('reactdemos/Module')
   */
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};
