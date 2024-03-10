package adamatti.view.dto;

import adamatti.model.Transaction;
import io.micronaut.serde.annotation.Serdeable;

import java.util.Date;

@Serdeable
public class ExtratoTransactionResponse {
    private int valor;
    private String tipo;
    private String descricao;
    private Date realizada_em;

    public ExtratoTransactionResponse(Transaction transaction) {
        this.valor = Math.abs(transaction.getValue());
        this.tipo = transaction.getValue() > 0 ? "c" : "d";
        this.descricao = transaction.getDescription();
        this.realizada_em = transaction.getCreatedAt();
    }

    public int getValor() {
        return valor;
    }

    public String getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public Date getRealizada_em() {
        return realizada_em;
    }
}
