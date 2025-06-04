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
    console.log("[worker] Requisição recebida:", request.method);

    if (request.method !== "POST") {
      console.log("[worker] Método inválido");
      return new Response("Método não permitido", { status: 405 });
    }

    try {
      const data = await request.json();
      console.log("[worker] JSON recebido:", JSON.stringify(data));

      const requiredFields = ['name', 'address', 'rating'];
      for (const field of requiredFields) {
        if (!data[field]) {
          console.log(`[worker] Campo ausente: ${field}`);
          return new Response(`Campo obrigatório ausente: ${field}`, { status: 400 });
        }
      }

      const emailText = `
📍 Novo lugar sugerido no app:

• Nome: ${data.name}
• Endereço: ${data.address}
• Avaliação: ${data.rating} estrelas
• Comentário: ${data.comment || '(nenhum)'}

👤 Contato:
• Nome: ${data.contactName || '(nenhum)'}
• Info: ${data.contactInfo || '(nenhuma)'}

🔒 Nota interna:
${data.privateNote || '(nenhuma)'}
`;

      const emailPayload = {
        from: "App Atipicali <app@atipicali.com>",
        to: "mail.for.luis.alves@gmail.com",
        subject: `Nova sugestão de lugar: ${data.name}`,
        text: emailText,
      };

      console.log("[worker] Payload do email:", JSON.stringify(emailPayload));

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      console.log("[worker] Resposta da API Resend:", res.status);

      if (!res.ok) {
        const err = await res.text();
        console.log("[worker] Erro ao enviar email:", err);
        return new Response(`Erro ao enviar email: ${err}`, { status: 500 });
      }

      console.log("[worker] Email enviado com sucesso!");
      return new Response("Email enviado com sucesso!", { status: 200 });

    } catch (err) {
      console.log("[worker] Erro no bloco try/catch:", err);
      return new Response(`Erro no Worker: ${err}`, { status: 500 });
    }
  },
};


