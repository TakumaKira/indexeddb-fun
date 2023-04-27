export default function play() {

  const dbPromise1 = idb.openDB('test-db1', 1);


  const dbPromise2 = idb.openDB('test-db2', 1, {upgrade: function (upgradeDb) {
    console.log('Creating a new object store.');
    if (!upgradeDb.objectStoreNames.contains('firstOS')) {
      upgradeDb.createObjectStore('firstOS');
    }
  }});


  const dbPromise3 = idb.openDB('test-db3', 1, {upgrade: function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('people')) {
      upgradeDb.createObjectStore('people', { keyPath: 'email' });
    }
    if (!upgradeDb.objectStoreNames.contains('notes')) {
      upgradeDb.createObjectStore('notes', { autoIncrement: true });
    }
    if (!upgradeDb.objectStoreNames.contains('logs')) {
      upgradeDb.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    }
  }});


  const dbPromise4 = idb.openDB('test-db4', 1, {upgrade: function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('people')) {
      const peopleOS = upgradeDb.createObjectStore('people', { keyPath: 'email' });
      peopleOS.createIndex('gender', 'gender', { unique: false });
      peopleOS.createIndex('ssn', 'ssn', { unique: true });
    }
    if (!upgradeDb.objectStoreNames.contains('notes')) {
      const notesOS = upgradeDb.createObjectStore('notes', { autoIncrement: true });
      notesOS.createIndex('title', 'title', { unique: false });
    }
    if (!upgradeDb.objectStoreNames.contains('logs')) {
      const logsOS = upgradeDb.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    }
  }});


  const dbPromise5 = idb.openDB('test-db5', 1, {upgrade: function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('store')) {
      const objectStore = upgradeDb.createObjectStore('store', { keyPath: 'name' });
      objectStore.createIndex('name', 'name', { unique: true });
      objectStore.createIndex('price', 'price', { unique: false });
      objectStore.createIndex('description', 'description', { unique: false });
      objectStore.createIndex('created', 'created', { unique: false });
    }
  }})
  dbPromise5
    .then(function (db) {
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');
      const item = {
        name: 'sandwich',
        price: 4.99,
        description: 'A very tasty sandwich',
        created: new Date().getTime(),
      };
      store.add(item);
      return tx.complete;
    })
    .then(function () {
      console.log('Added item to the store!');
    })
    .then(function () {

      dbPromise5
        .then(function (db) {
          const tx = db.transaction('store', 'readonly');
          const store = tx.objectStore('store');
          return store.get('sandwich');
        })
        .then(function (val) {
          console.dir(val);
        })
        .then(function () {

          dbPromise5
            .then(function (db) {
              const tx = db.transaction('store', 'readwrite');
              const store = tx.objectStore('store');
              const item = {
                name: 'sandwich',
                price: 99.99,
                description: 'A very tasty, but quite expensive, sandwich',
                created: new Date().getTime(),
              };
              store.put(item);
              return tx.complete;
            })
            .then(function () {
              console.log('Item updated!');
            })
            .then(function () {

              dbPromise5
                .then(function (db) {
                  const tx = db.transaction('store', 'readwrite');
                  const store = tx.objectStore('store');
                  // store.delete('sandwich');
                  return tx.complete;
                })
                .then(function () {
                  console.log('Item deleted.');
                })
                .then(function () {

                  dbPromise5
                    .then(function (db) {
                      const tx = db.transaction('store', 'readonly');
                      const store = tx.objectStore('store');
                      return store.getAll();
                    })
                    .then(function (items) {
                      console.log('Items by name:', items);

                      dbPromise5
                        .then(function (db) {
                          const tx = db.transaction('store', 'readonly');
                          const store = tx.objectStore('store');
                          return store.openCursor();
                        })
                        .then(function logItems(cursor) {
                          if (!cursor) {
                            return;
                          }
                          console.log('Cursored at:', cursor.key);
                          for (const field in cursor.value) {
                            console.log(cursor.value[field]);
                          }
                          return cursor.continue().then(logItems);
                        })
                        .then(function () {
                          console.log('Done cursoring.');

                          searchItems(0, 100);
                          function searchItems(lower, upper) {
                            if (lower === '' && upper === '') {
                              return;
                            }

                            let range;
                            if (lower !== '' && upper !== '') {
                              range = IDBKeyRange.bound(lower, upper);
                            } else if (lower === '') {
                              range = IDBKeyRange.upperBound(upper);
                            } else {
                              range = IDBKeyRange.lowerBound(lower);
                            }

                            dbPromise5
                              .then(function (db) {
                                const tx = db.transaction(['store'], 'readonly');
                                const store = tx.objectStore('store');
                                const index = store.index('price');
                                return index.openCursor(range);
                              })
                              .then(function showRange(cursor) {
                                if (!cursor) {
                                  return;
                                }
                                console.log('Cursored at:', cursor.key);
                                for (const field in cursor.value) {
                                  console.log(cursor.value[field]);
                                }
                                return cursor.continue().then(showRange);
                              })
                              .then(function () {
                                console.log('Done cursoring.');
                              });
                          }

                        });

                    });

                });

            });

        });

    });


  const dbPromise7 = idb.openDB('test-db7', 2, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('store', { keyPath: 'name' });
      case 1:
        const peopleStore = upgradeDb.transaction.objectStore('store');
        peopleStore.createIndex('price', 'price');
    }
  })
  .then(function () {

    const dbPromise8 = idb.openDB('test-db7', 3, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('store', { keyPath: 'name' });
        case 1: {
          const storeOS = upgradeDb.transaction.objectStore('store');
          storeOS.createIndex('price', 'price');
        }
        case 2: {
          const storeOS = upgradeDb.transaction.objectStore('store');
          storeOS.createIndex('description', 'description');
        }
      }
    });

  });


  {
    let db;

    const openRequest = indexedDB.open('test_db', 1);

    openRequest.onupgradeneeded = function (e) {
      db = e.target.result;
      console.log('running onupgradeneeded');
      if (!db.objectStoreNames.contains('store')) {
        const storeOS = db.createObjectStore('store', { keyPath: 'name' });
      }
    };
    openRequest.onsuccess = function (e) {
      console.log('running onsuccess');
      db = e.target.result;
      addItem();
    };
    openRequest.onerror = function (e) {
      console.log('onerror!');
      console.dir(e);
    };

    function addItem() {
      const transaction = db.transaction(['store'], 'readwrite');
      const store = transaction.objectStore('store');
      const item = {
        name: 'banana',
        price: '$2.99',
        description: 'It is a purple banana!',
        created: new Date().getTime(),
      };

      const request = store.add(item);

      request.onerror = function (e) {
        console.log('Error', e.target.error.name);
      };
      request.onsuccess = function (e) {
        console.log('Woot! Did it');
      };
    }
  }
}
