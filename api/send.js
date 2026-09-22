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

        // E-mail que receberá os cadastros
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

        // Evita receber uma lista inválida de anexos
        const anexosValidos = Array.isArray(attachments)
            ? attachments.filter((anexo) => {
                  return (
                      anexo &&
                      typeof anexo.filename === "string" &&
                      typeof anexo.content === "string"
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
                    // Remetente usando o domínio verificado no Resend
                    from: "M&IC Corretores <no-reply@miccorretores.com.br>",

                    // Destinatário definido no servidor
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
            error: "Erro interno ao enviar o e-mail.",
            details: error.message
        });
    }
}
