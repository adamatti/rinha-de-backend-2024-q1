package adamatti.view.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class TransactionResponse {
    private int limite;
    private int saldo;

    public TransactionResponse(int limite, int saldo) {
        this.limite = limite;
        this.saldo = saldo;
    }

    public int getLimite() {
        return limite;
    }

    public int getSaldo() {
        return saldo;
    }
}
