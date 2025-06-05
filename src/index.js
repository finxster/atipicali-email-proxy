/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    // CORS padrão
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // ou especifique seu domínio
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      // Pré-flight request
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== "POST") {
      return new Response("Método não permitido", {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const data = await request.json();

      const emailText = `
📍 Novo lugar sugerido no app:

• Nome: ${data.name}
• Endereço: ${data.address}
• Avaliação: ${data.rating} estrelas
• Comentário: ${data.comment || '(nenhum)'}
• Imagem: ${data.imageUuid || '(nenhum)'}

👤 Contato:
• Nome: ${data.contactName || '(nenhum)'}
• Info: ${data.contactInfo || '(nenhuma)'}

🔒 Nota interna:
${data.privateNote || '(nenhuma)'}
`;

      const emailPayload = {
        from: "App AtipicALI <new@places.atipicali.com>",
        to: "mail.for.luis.alves@gmail.com",
        subject: `Nova sugestão: ${data.name}`,
        text: emailText,
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!res.ok) {
        const err = await res.text();
        return new Response(`${err}`, {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response("Email enviado com sucesso!", {
        status: 200,
        headers: corsHeaders,
      });

    } catch (err) {
      return new Response(`Erro no Worker: ${err}`, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};



