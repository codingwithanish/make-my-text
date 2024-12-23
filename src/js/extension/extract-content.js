import { isProbablyReaderable, Readability } from '@mozilla/readability';

function canBeParsed(document) {
  const result = isProbablyReaderable(document, {
    minContentLength: 100
  });
  console.log("canBeParsed result:", result);
  return result;
}

function parse(document) {
  alert("extract script working");
  console.log("extract script working");

  const canParse = canBeParsed(document);
  console.log("canBeParsed:", canParse);

  if (!canParse) {
    console.log("Document cannot be parsed.");
    return false;
  }

  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();
  console.log("Parsed article:", article);

  if (!article) {
    console.log("Readability parsing failed.");
    return false;
  }

  return article.textContent;
}

parse(window.document);
