import BackboneFsm from 'backbone-machina';

/**
 * This is the base FSM class that all FSMs in the application
 * should derive from, either directly or indirectly. If you want to
 * apply a customization to all FSMs in the application, do it here.
 */
const Fsm = BackboneFsm;

export default Fsm;
