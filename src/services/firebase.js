// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore';
import logger from '../utils/logger';

const firebaseConfig = {
  apiKey: "AIzaSyExample",
  authDomain: "travelkarute.firebaseapp.com",
  projectId: "travelkarute",
  storageBucket: "travelkarute.appspot.com",
  messagingSenderId: "635350270309",
  appId: "1:635350270309:web:2498d21f9f134defeda18c"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// オフライン対応のためのデータ永続化を無効化
// 永続化がフォームデータのリセット問題を引き起こす可能性があるため、一時的にコメントアウト
/*
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  logger.warn("Firebase永続化エラー:", { error: err });
}
*/

// クライアント関連のFirestore操作
const clientsService = {
  // クライアント会社情報を検索（部分一致対応）
  searchClients: async (searchText) => {
    try {
      // 検索テキストを小文字に変換
      const searchLower = searchText.toLowerCase();
      
      // Firestoreから全クライアントを取得（実用的なサイズの場合）
      // 大規模なデータの場合はサーバー側での制約を検討
      const q = query(
        collection(db, 'clients'),
        orderBy('nameIndex'),
        limit(100) // 適切な上限を設定
      );
      
      const querySnapshot = await getDocs(q);
      const allClients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // クライアント側で部分一致フィルタリングを実行
      const filteredClients = allClients.filter(client => {
        const clientName = (client.name || '').toLowerCase();
        const clientNameIndex = (client.nameIndex || '').toLowerCase();
        return clientName.includes(searchLower) || clientNameIndex.includes(searchLower);
      });
      
      // 担当者名でも検索
      const contactMatches = allClients.filter(client => {
        if (!client.contacts || !Array.isArray(client.contacts)) return false;
        
        return client.contacts.some(contact => {
          const personName = (contact.personName || '').toLowerCase();
          const phone = (contact.phone || '').toLowerCase();
          const email = (contact.email || '').toLowerCase();
          return personName.includes(searchLower) || 
                 phone.includes(searchLower) || 
                 email.includes(searchLower);
        });
      });
      
      // 重複を排除して結合
      const combinedResults = [...filteredClients];
      contactMatches.forEach(contactMatch => {
        if (!combinedResults.some(client => client.id === contactMatch.id)) {
          combinedResults.push(contactMatch);
        }
      });
      
      // 関連度の高い順にソート（完全一致→部分一致の順）
      combinedResults.sort((a, b) => {
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        
        // 完全一致を優先
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;
        
        // 前方一致を次に優先
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
        
        // それ以外は名前順
        return aName.localeCompare(bName);
      });
      
      return combinedResults.slice(0, 20); // 上位20件を返す
    } catch (error) {
      logger.error('クライアント検索エラー:', { error });
      return [];
    }
  },
  
  // すべてのクライアント情報を取得
  getAllClients: async () => {
    try {
      const q = query(
        collection(db, 'clients'),
        orderBy('nameIndex'),
        limit(500) // 適切な上限を設定
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('クライアント一覧取得エラー:', { error });
      return [];
    }
  },
  
  // クライアント検索（管理画面用・詳細検索）
  searchClientsByQuery: async (searchQuery) => {
    try {
      const allClients = await clientsService.getAllClients();
      if (!searchQuery || searchQuery.trim() === '') {
        return allClients;
      }
      
      const searchLower = searchQuery.toLowerCase().trim();
      
      // 会社名、担当者名、電話番号、メールアドレスで検索
      return allClients.filter(client => {
        // 会社名で検索
        const clientName = (client.name || '').toLowerCase();
        if (clientName.includes(searchLower)) {
          return true;
        }
        
        // 担当者名・電話・メールで検索
        if (client.contacts && Array.isArray(client.contacts)) {
          return client.contacts.some(contact => {
            const personName = (contact.personName || '').toLowerCase();
            const phone = (contact.phone || '').toLowerCase();
            const email = (contact.email || '').toLowerCase();
            
            return personName.includes(searchLower) || 
                  phone.includes(searchLower) || 
                  email.includes(searchLower);
          });
        }
        
        return false;
      });
    } catch (error) {
      logger.error('クライアント詳細検索エラー:', { error });
      return [];
    }
  },
  
  // クライアント情報を取得
  getClient: async (clientId) => {
    try {
      const docRef = doc(db, 'clients', clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      logger.error('クライアント取得エラー:', { error });
      return null;
    }
  },
  
  // クライアント情報を保存（新規または更新）
  saveClient: async (clientData, clientId = null) => {
    try {
      const timestamp = serverTimestamp();
      
      // 検索用のインデックスフィールドを作成（小文字変換）
      const nameIndex = clientData.name ? clientData.name.toLowerCase() : '';
      
      const dataToSave = {
        ...clientData,
        nameIndex,
        lastUpdated: timestamp
      };
      
      if (clientId) {
        // 更新
        await updateDoc(doc(db, 'clients', clientId), dataToSave);
        return clientId;
      } else {
        // 新規作成
        const docRef = await addDoc(collection(db, 'clients'), dataToSave);
        return docRef.id;
      }
    } catch (error) {
      logger.error('クライアント保存エラー:', { error });
      throw error;
    }
  },
  
  // 連絡先を追加
  addContact: async (clientId, contactData) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('クライアントが存在しません');
      }
      
      const currentData = clientDoc.data();
      const contacts = currentData.contacts || [];
      
      // 新しい連絡先を追加
      const newContact = {
        id: `contact-${Date.now()}`,
        ...contactData,
        lastUsed: serverTimestamp()
      };
      
      // プライマリー連絡先の設定
      if (newContact.isPrimary) {
        // 他のプライマリーをfalseに設定
        contacts.forEach(contact => {
          contact.isPrimary = false;
        });
      } else if (contacts.length === 0) {
        // 最初の連絡先の場合は自動的にプライマリーに
        newContact.isPrimary = true;
      }
      
      // 連絡先リストを更新
      const updatedContacts = [...contacts, newContact];
      
      // クライアントドキュメントを更新
      await updateDoc(clientRef, {
        contacts: updatedContacts,
        lastUpdated: serverTimestamp()
      });
      
      return newContact;
    } catch (error) {
      logger.error('連絡先追加エラー:', { error });
      throw error;
    }
  },
  
  // 連絡先を更新
  updateContact: async (clientId, contactId, contactData) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('クライアントが存在しません');
      }
      
      const currentData = clientDoc.data();
      const contacts = currentData.contacts || [];
      
      // 指定されたcontactIdを持つ連絡先を更新
      const updatedContacts = contacts.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            ...contactData,
            lastUsed: serverTimestamp()
          };
        }
        // プライマリー設定時は他のプライマリーを解除
        if (contactData.isPrimary && contact.id !== contactId) {
          return { ...contact, isPrimary: false };
        }
        return contact;
      });
      
      // クライアントドキュメントを更新
      await updateDoc(clientRef, {
        contacts: updatedContacts,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      logger.error('連絡先更新エラー:', { error });
      throw error;
    }
  },
  
  // 連絡先を削除
  deleteContact: async (clientId, contactId) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (!clientDoc.exists()) {
        throw new Error('クライアントが存在しません');
      }
      
      const currentData = clientDoc.data();
      const contacts = currentData.contacts || [];
      
      // 削除対象の連絡先がプライマリーかチェック
      const targetContact = contacts.find(c => c.id === contactId);
      const wasTargetPrimary = targetContact?.isPrimary || false;
      
      // 連絡先を削除
      const filteredContacts = contacts.filter(c => c.id !== contactId);
      
      // 削除した連絡先がプライマリーだった場合は別の連絡先をプライマリーに設定
      if (wasTargetPrimary && filteredContacts.length > 0) {
        filteredContacts[0].isPrimary = true;
      }
      
      // クライアントドキュメントを更新
      await updateDoc(clientRef, {
        contacts: filteredContacts,
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      logger.error('連絡先削除エラー:', { error });
      throw error;
    }
  }
};

export { db, clientsService };