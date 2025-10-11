"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentReference, DocumentData, doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface UseCollectionOptions {
  // You can add options like 'includeMetadataChanges' if needed
}

export function useCollection<T>(query: Query<DocumentData> | null, options?: UseCollectionOptions) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
        setData([]);
        setLoading(false);
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(query, 
      (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching collection: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]); // Re-run effect if query changes

  return { data, loading, error };
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null, options?: UseCollectionOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
        setData(null);
        setLoading(false);
        return;
    };

    setLoading(true);
    const unsubscribe = onSnapshot(ref,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData({ id: docSnapshot.id, ...docSnapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching document: ", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]); // Re-run effect if ref changes

  return { data, loading, error };
}
