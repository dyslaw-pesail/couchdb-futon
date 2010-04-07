// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

couchTests.view_update_seq = function(debug) {
  var db = new CouchDB("test_suite_db", {"X-Couch-Full-Commit":"false"});
  db.deleteDb();
  db.createDb();
  if (debug) debugger;

  T(db.info().update_seq == 0);

  var designDoc = {
    _id:"_design/test",
    language: "javascript",
    views: {
      all_docs: {
        map: "function(doc) { emit(doc.integer, doc.string) }"
      },
      summate: {
        map:"function (doc) {emit(doc.integer, doc.integer)};",
        reduce:"function (keys, values) { return sum(values); };"
      }
    }
  }
  T(db.save(designDoc).ok);

  T(db.info().update_seq == 1);

  var resp = db.allDocs({});

  T(resp.rows.length == 1);
  T(resp.update_seq == 1);

  var docs = makeDocs(0, 100);
  db.bulkSave(docs);

  resp = db.allDocs({limit: 1});
  T(resp.rows.length == 1);
  T(resp.update_seq == 101);

  resp = db.view('test/all_docs', {limit: 1});
  T(resp.rows.length == 1);
  T(resp.update_seq == 101);

  resp = db.view('test/summate', {});
  T(resp.rows.length == 1);
  T(resp.update_seq == 101);

  db.save({"id":"0"});
  resp = db.view('test/all_docs', {limit: 1,stale: "ok"});
  T(resp.rows.length == 1);
  T(resp.update_seq == 101);

  resp = db.view('test/all_docs', {limit: 1});
  T(resp.rows.length == 1);
  T(resp.update_seq == 102);

  resp = db.view('test/all_docs',{},["0","1"]);
  T(resp.update_seq == 102);

  resp = db.view('test/all_docs',{},["0","1"]);
  T(resp.update_seq == 102);

  resp = db.view('test/summate',{group:true},["0","1"]);
  T(resp.update_seq == 102);

};
