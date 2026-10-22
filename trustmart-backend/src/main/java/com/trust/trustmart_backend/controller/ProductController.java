
package com.trust.trustmart_backend.controller;

import com.trust.trustmart_backend.Role;
import com.trust.trustmart_backend.User;
import com.trust.trustmart_backend.UserRepository;
import com.trust.trustmart_backend.product.Product;
import com.trust.trustmart_backend.product.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductController(
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"
                        ));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(
            @Valid @RequestBody Product product,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in before creating a listing"
            );
        }

        User seller = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated account not found"
                        ));

        if (seller.getRole() != Role.SELLER
                && seller.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only sellers and admins can create listings"
            );
        }

        product.setId(null);
        product.setSellerName(seller.getName());

        return productRepository.save(product);
    }
}
