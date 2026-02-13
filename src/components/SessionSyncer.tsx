import { useSessionSync } from "../stores/sessionStore";

function SessionSyncer() {
  useSessionSync();
  return null;
}

export default SessionSyncer;
