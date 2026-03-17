import { getSearchSuggestions } from './src/app/actions/product';

async function test() {
  try {
    const res = await getSearchSuggestions('audi');
    console.log('Success:', res);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
