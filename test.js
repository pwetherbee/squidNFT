const query = `
  query collectorGallery($address: String!) {
    hic_et_nunc_token_holder(where: {holder_id: {_eq: $address}, quantity: {_gt: "0"}, token: {supply: {_gt: "0"}}}, order_by: {id: desc}) {
      token {
        id
      }
    }
  }
`;

async function fetchGraphQL(operationsDoc, operationName, variables) {
  const result = await fetch("https://api.hicdex.com/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
}

async function doFetch(address) {
  const { errors, data } = await fetchGraphQL(query, "collectorGallery", {
    address: address,
  });
  if (errors) {
    console.error(errors);
  }
  const result = data.hic_et_nunc_token_holder;
  console.log({ result });
  return result;
}

async function checkHasOBJKT(id, address) {
  const objkts = await doFetch(address);
  return !!objkts.filter((objkt) => objkt.token.id == id).length;
}

const run = async function () {
  const objktID = 448341; //your objkt ID
  const viewerAddress = new URLSearchParams(window.location.search).get(
    "viewer"
  );
  // const  viewerAddress = ""; //the viewers address
  // const hasOBJKT = await checkHasOBJKT(objktID, viewerAddress);
  // console.log(hasOBJKT);
};
run();
