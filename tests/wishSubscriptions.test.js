import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribeWishSources,wishTime} from '../src/utils/wishSubscriptions.js';

function fixture(ids) {
  const requests=[]; const states=[]; let stopped=0;
  const stop=subscribeWishSources(ids,(collection,owners,next,fail)=>{
    requests.push({collection,owners,next,fail}); return ()=>stopped++;
  },state=>states.push(state));
  return {requests,states,stop,get stopped(){return stopped;},get latest(){return states.at(-1);}};
}
test('a denied optional legacy source does not invalidate current wishes',()=>{
  const f=fixture(['a']);
  f.requests[0].next([{id:'current',createdAt:'2026-10-05'}]);
  assert.equal(f.latest.loading,true);
  f.requests[1].fail({code:'permission-denied'});
  assert.equal(f.latest.error,false);assert.equal(f.latest.loading,false);
  assert.equal(f.latest.items[0].id,'current');
});
test('current permission failures and legacy network failures remain visible',()=>{
  const f=fixture(['a']);
  f.requests[0].fail({code:'permission-denied'});f.requests[1].next([]);
  assert.equal(f.latest.error,true);
  f.requests[0].next([]);assert.equal(f.latest.error,false);
  f.requests[1].fail({code:'unavailable'});assert.equal(f.latest.error,true);
});
test('keeps accessible legacy wishes and sorts mixed timestamp formats',()=>{
  const f=fixture(['a']);
  f.requests[0].next([{id:'new',createdAt:{toMillis:()=>2000}},{id:'invalid',createdAt:'bad'}]);
  f.requests[1].next([{id:'old',createdAt:{seconds:1}},{id:'iso',createdAt:'1970-01-01T00:00:03Z'}]);
  assert.deepEqual(f.latest.items.map(item=>item.id),['iso','new','old','invalid']);
  assert.equal(wishTime(undefined),0);
});
test('batches owners and stops all listeners without publishing stale responses',()=>{
  const owners=Array.from({length:24},(_,i)=>`friend-${i}`);
  const f=fixture([...owners,owners[0]]);
  assert.equal(f.requests.length,6); // formerly 48 listeners
  assert.ok(f.requests.every(request=>request.owners.length<=10));
  f.stop();assert.equal(f.stopped,6);
  const before=f.states.length;f.requests[0].next([]);assert.equal(f.states.length,before);
});
test('empty friend list finishes without opening listeners',()=>{
  const f=fixture([]);assert.equal(f.requests.length,0);
  assert.deepEqual(f.latest,{items:[],loading:false,error:false});
});
