package adamatti.repository;

import adamatti.model.Transaction;
import io.micronaut.runtime.ApplicationConfiguration;
import io.micronaut.transaction.annotation.ReadOnly;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;

import java.util.List;

@Singleton
public class TransactionRepository {
    private final EntityManager entityManager;
    private final ApplicationConfiguration applicationConfiguration;

    public TransactionRepository(
            EntityManager entityManager,
            ApplicationConfiguration applicationConfiguration
    ) {
        this.entityManager = entityManager;
        this.applicationConfiguration = applicationConfiguration;
    }

    @ReadOnly
    public List<Transaction> lastTransactions(int clientId) {
        // this is just as example, I could use the em way here
        return entityManager.createQuery("FROM Transaction t WHERE clientId = ?1 ORDER BY id DESC", Transaction.class)
                .setParameter(1, clientId)
                .setMaxResults(10)
                .getResultList();
    }

    public void insertTransaction(int value, String description, int clientId) {
        entityManager.createNativeQuery("""
                BEGIN;
                		UPDATE clients SET balance = balance + ?1 WHERE id = ?3 ;
                		INSERT INTO transactions (value, description, client_id) VALUES (?1, ?2, ?3);
                END;
                """)
                .setParameter(1, value)
                .setParameter(2, description)
                .setParameter(3, clientId)
                .executeUpdate();
    }
}
