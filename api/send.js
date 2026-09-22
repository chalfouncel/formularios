export default async function handler(req, res) {
  // Aceita somente requisições POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const {
      subject,
      html,
      attachments
    } = req.body || {};

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // Se EMAIL_DESTINO não estiver configurada,
    // utiliza este endereço como padrão.
    const EMAIL_DESTINO =
      process.env.EMAIL_DESTINO || "chalfouncel@gmail.com";

    if (!RESEND_API_KEY) {
      return res.status(500).json({
        error: "A variável RESEND_API_KEY não está configurada no servidor."
      });
    }

    if (!html || typeof html !== "string") {
      return res.status(400).json({
        error: "O conteúdo HTML do e-mail não foi informado."
      });
    }

    // Mantém somente anexos válidos
    const anexosValidos = Array.isArray(attachments)
      ? attachments.filter((anexo) => {
          return (
            anexo &&
            typeof anexo.filename === "string" &&
            anexo.filename.trim() !== "" &&
            typeof anexo.content === "string" &&
            anexo.content.trim() !== ""
          );
        })
      : [];

    const respostaResend = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "M&IC Corretores <documentos@miccorretores.com.br>",
          to: [EMAIL_DESTINO],
          subject:
            typeof subject === "string" && subject.trim()
              ? subject.trim()
              : "Novo cadastro de documentos",
          html,
          attachments: anexosValidos
        })
      }
    );

    const data = await respostaResend.json();

    if (!respostaResend.ok) {
      console.error("Erro retornado pelo Resend:", data);

      return res.status(respostaResend.status).json({
        error: "O Resend recusou o envio do e-mail.",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: "E-mail enviado com sucesso.",
      data
    });
  } catch (error) {
    console.error("Erro interno no envio:", error);

    return res.status(500).json({
      error: "Erro interno ao enviar o e-mail."
    });
  }
}
