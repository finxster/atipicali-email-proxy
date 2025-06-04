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
    if (request.method !== "POST") {
      return new Response("Método não permitido", { status: 405 });
    }

    try {
      const data = await request.json();

      const requiredFields = ['name', 'address', 'rating'];
      for (const field of requiredFields) {
        if (!data[field]) {
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
        from: "Seu App <contato@seuapp.resend.dev>", // ou domínio verificado
        to: "voce@seuemail.com", // seu email de recebimento
        subject: `Nova sugestão de lugar: ${data.name}`,
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
        return new Response(`Erro ao enviar email: ${err}`, { status: 500 });
      }

      return new Response("Email enviado com sucesso!", { status: 200 });

    } catch (err) {
      return new Response(`Erro no Worker: ${err}`, { status: 500 });
    }
  },
};

