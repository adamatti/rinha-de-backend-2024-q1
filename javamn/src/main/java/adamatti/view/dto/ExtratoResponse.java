package adamatti.view.dto;

import adamatti.model.Client;
import adamatti.model.Transaction;
import io.micronaut.serde.annotation.Serdeable;

import java.util.Date;
import java.util.List;

/*
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
*/
@Serdeable
public class ExtratoResponse {
    private int total;
    private Date data_extrato;

    private int limite;

    private List<ExtratoTransactionResponse> ultimas_transacoes;

    public ExtratoResponse(Client client, List<Transaction> transacoes) {
        this.total = client.getBalance();
        this.data_extrato = new Date();
        this.limite = client.getLimit();
        this.ultimas_transacoes = transacoes.stream().map(ExtratoTransactionResponse::new).toList();
    }

    public int getTotal() {
        return total;
    }

    public Date getData_extrato() {
        return data_extrato;
    }

    public int getLimite() {
        return limite;
    }

    public List<ExtratoTransactionResponse> getUltimas_transacoes() {
        return ultimas_transacoes;
    }
}
