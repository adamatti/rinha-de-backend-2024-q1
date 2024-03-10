package adamatti.repository;

import adamatti.model.Client;
import io.micronaut.runtime.ApplicationConfiguration;
import io.micronaut.transaction.TransactionDefinition;
import io.micronaut.transaction.annotation.ReadOnly;
import jakarta.inject.Singleton;
import jakarta.persistence.EntityManager;

import java.util.Optional;

@Singleton
public class ClientRepository {
    private final EntityManager entityManager;
    private final ApplicationConfiguration applicationConfiguration;

    public ClientRepository(
            EntityManager entityManager,
            ApplicationConfiguration applicationConfiguration
    ) {
        this.entityManager = entityManager;
        this.applicationConfiguration = applicationConfiguration;
    }

    @ReadOnly(isolation = TransactionDefinition.Isolation.READ_UNCOMMITTED)
    public Optional<Client> findById(int id) {
        return Optional.ofNullable(entityManager.find(Client.class, id));
    }
}
