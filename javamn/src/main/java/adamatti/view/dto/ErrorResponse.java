package adamatti.view.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class ErrorResponse extends TransactionResponse {
    private String message;
    public ErrorResponse(String message, int limite, int saldo) {
        super(limite, saldo);
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
