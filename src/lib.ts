export async function generateBannerbearImage(templateId, modifications, options = {}) {
  const API_KEY = "bb_pr_2d87f5d7bc7d7fc1a1df65513b35ca";
  
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${API_KEY}`);
  
  const requestData = {
    template: templateId,
    modifications: modifications,
    webhook_url: options.webhook_url || null,
    transparent: options.transparent || false,
    metadata: options.metadata || null
  };
  
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(requestData),
    redirect: "follow"
  };
  
  try {
    const response = await fetch("https://sync.api.bannerbear.com/v2/images", requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(result)
    
    // Return the image URL (choose your preferred format)
    return {
      imageUrl: result.image_url,
      imageUrlPng: result.image_url_png,
      imageUrlJpg: result.image_url_jpg,
      uid: result.uid,
      status: result.status
    };
    
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Usage example:
async function createBadge() {
  try {
    const modifications = [
      {
        name: "message",
        text: "Christian MESSAN",
        color: null,
        background: null
      },
      {
        name: "poste", 
        text: "Directeur Exécutif",
        color: null,
        background: null
      }
    ];
    
    const result = await generateBannerbearImage("Aqa9wzDP2eQkZJogk7", modifications);
    
    console.log("Image generated successfully!");
    console.log("Image URL:", result.imageUrl);
    
    // Display the image
    const img = document.createElement('img');
    img.src = result.imageUrl;
    document.body.appendChild(img);
    
    return result.imageUrl;
    
  } catch (error) {
    console.error("Failed to create badge:", error);
  }
}

// Even simpler version if you just want the URL
async function getBadgeImageUrl(name, position) {
  const modifications = [
    { name: "message", text: name, color: null, background: null },
    { name: "poste", text: position, color: null, background: null }
  ];
  
  const result = await generateBannerbearImage("Aqa9wzDP2eQkZJogk7", modifications);
  return result.imageUrl;
}

// Usage:
// const imageUrl = await getBadgeImageUrl("Christian MESSAN", "Directeur Exécutif");