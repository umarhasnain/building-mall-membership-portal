import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useNotifications(userId) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {

    if (!userId) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

  }, [userId]);

  return notifications;
}
